import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, MODEL_SMART } from "@/lib/ai/client";
import { FORM_ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts/form-assistant";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { message, conversation_id, form_type } = body;

  // Get or create conversation
  let convId = conversation_id;
  if (!convId) {
    const { data: conv } = await supabase
      .from("imm_ai_conversations")
      .insert({
        user_id: user.id,
        title: `Form Assistant: ${form_type || "General"}`,
        context_type: "form_filling",
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

  // Get history
  let messages: { role: "user" | "assistant"; content: string }[] = [];
  if (convId) {
    const { data: history } = await supabase
      .from("imm_ai_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(30);

    if (history) {
      messages = history.filter((m) => m.role !== "system").map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    }
  } else {
    messages = [{ role: "user", content: message }];
  }

  const systemPrompt = form_type
    ? `${FORM_ASSISTANT_SYSTEM_PROMPT}\n\nThe user is currently filling out: ${form_type}`
    : FORM_ASSISTANT_SYSTEM_PROMPT;

  const client = getAnthropicClient();
  const stream = await client.messages.stream({
    model: MODEL_SMART,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  let fullResponse = "";
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          fullResponse += event.delta.text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text, conversation_id: convId })}\n\n`),
          );
        }
      }

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
