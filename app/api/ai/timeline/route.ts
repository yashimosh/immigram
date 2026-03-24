import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";

import { TIMELINE_SYSTEM_PROMPT } from "@/lib/ai/prompts/timeline";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { case_id } = body;

  const { data: caseData } = await supabase
    .from("imm_cases")
    .select("*, visa_programs(*)")
    .eq("id", case_id)
    .eq("user_id", user.id)
    .single();

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const userMessage = `Generate a detailed immigration timeline for this case:

CASE: ${caseData.title}
VISA: ${caseData.visa_type} for ${caseData.target_country}
FROM: ${caseData.origin_country}
CURRENT STATUS: ${caseData.status}
TARGET DATE: ${caseData.target_date || "Not specified"}

${caseData.visa_programs ? `VISA PROGRAM DETAILS:\n${JSON.stringify(caseData.visa_programs, null, 2)}` : ""}

Today's date is ${new Date().toISOString().split("T")[0]}. Create a realistic timeline with milestones.`;

  try {
    const resultText = await getCompletion({
      systemPrompt: TIMELINE_SYSTEM_PROMPT,
      userMessage,
      model: MODEL_FAST,
      maxTokens: 2048,
    });

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse timeline" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Save milestones to case
    if (result.milestones?.length > 0) {
      const milestones = result.milestones.map((m: { title: string; description: string; estimated_date: string }, i: number) => ({
        case_id,
        title: m.title,
        description: m.description,
        due_date: m.estimated_date,
        sort_order: i,
        ai_generated: true,
      }));

      await supabase.from("imm_case_milestones").insert(milestones);
    }

    // Save assessment
    await supabase.from("imm_assessments").insert({
      user_id: user.id,
      assessment_type: "timeline",
      input_data: { case_id },
      result_data: result,
      summary: result.summary,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ error: "Failed to generate timeline" }, { status: 500 });
  }
}
