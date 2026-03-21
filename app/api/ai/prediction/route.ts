import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_SMART } from "@/lib/ai/client";
import { PREDICTION_SYSTEM_PROMPT } from "@/lib/ai/prompts/prediction";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { case_id } = body;

  // Get case data
  const { data: caseData } = await supabase
    .from("imm_cases")
    .select("*, visa_programs(*)")
    .eq("id", case_id)
    .eq("user_id", user.id)
    .single();

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("imm_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const userMessage = `Predict the outcome for this immigration case:

CASE DETAILS:
${JSON.stringify(caseData, null, 2)}

APPLICANT PROFILE:
${JSON.stringify(profile, null, 2)}

Provide a realistic prediction with supporting factors.`;

  try {
    const resultText = await getCompletion({
      systemPrompt: PREDICTION_SYSTEM_PROMPT,
      userMessage,
      model: MODEL_SMART,
      maxTokens: 2048,
      temperature: 0.3,
    });

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse prediction" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Save assessment
    await supabase.from("imm_assessments").insert({
      user_id: user.id,
      assessment_type: "outcome_prediction",
      input_data: { case_id },
      result_data: result,
      overall_score: result.approval_probability,
      summary: `Approval probability: ${result.approval_probability}%`,
    });

    // Update case with AI score
    await supabase
      .from("imm_cases")
      .update({
        ai_approval_score: result.approval_probability,
        ai_risk_factors: result.risk_factors,
      })
      .eq("id", case_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: "Failed to predict outcome" }, { status: 500 });
  }
}
