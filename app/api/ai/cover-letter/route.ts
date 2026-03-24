import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";
import { COVER_LETTER_SYSTEM_PROMPT } from "@/lib/ai/prompts/cover-letter";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { visa_type, target_country, purpose, background, achievements, tone = "professional" } = body;

  const userMessage = `Write an immigration cover letter / personal statement with the following details:

VISA TYPE: ${visa_type}
TARGET COUNTRY: ${target_country}
PURPOSE: ${purpose}
TONE: ${tone}

APPLICANT BACKGROUND:
${background}

KEY ACHIEVEMENTS / QUALIFICATIONS:
${achievements}

Write a complete, ready-to-use cover letter. Make it compelling, honest, and tailored to the specific visa requirements.`;

  try {
    const letter = await getCompletion({
      systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
      userMessage,
      model: MODEL_FAST,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return NextResponse.json({ letter });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
