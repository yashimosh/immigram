import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, MODEL_FAST, MODEL_SMART } from "@/lib/ai/client";
import { getChatSystemPromptWithContext } from "@/lib/ai/prompts/chatbot";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { message, conversation_id, context_type = "general", case_id } = body;

  if (!message?.trim()) {
    return new Response("Message is required", { status: 400 });
  }

  // Get or create conversation
  let convId = conversation_id;
  if (!convId) {
    const { data: conv } = await supabase
      .from("imm_ai_conversations")
      .insert({
        user_id: user.id,
        title: message.slice(0, 50),
        context_type,
        case_id: case_id || null,
      })
      .select("id")
      .single();
    convId = conv?.id;
  }

  // Save user message
  if (convId) {
    await supabase.from("imm_ai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });
  }

  // Get conversation history
  let messages: { role: "user" | "assistant" | "system"; content: string }[] = [];
  if (convId) {
    const { data: history } = await supabase
      .from("imm_ai_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (history) {
      messages = history
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
    }
  } else {
    messages = [{ role: "user", content: message }];
  }

  // Get case context if provided
  let caseContext: string | undefined;
  if (case_id) {
    const { data: caseData } = await supabase
      .from("imm_cases")
      .select("*")
      .eq("id", case_id)
      .eq("user_id", user.id)
      .single();
    if (caseData) {
      caseContext = JSON.stringify(caseData);
    }
  }

  // Determine model — use smart model for complex questions
  const complexKeywords = ["legal", "law", "appeal", "deny", "denied", "deportation", "asylum", "refugee", "waiver", "inadmissible"];
  const isComplex = complexKeywords.some((kw) => message.toLowerCase().includes(kw));
  const model = isComplex ? MODEL_SMART : MODEL_FAST;

  const client = getAIClient();
  const systemPrompt = getChatSystemPromptWithContext(caseContext);

  const stream = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  // Collect full response for saving
  let fullResponse = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text, conversation_id: convId })}\n\n`),
          );
        }
      }

      // Save assistant message
      if (convId && fullResponse) {
        await supabase.from("imm_ai_messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: fullResponse,
        });
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
