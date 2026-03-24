import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";
import { ELIGIBILITY_SYSTEM_PROMPT } from "@/lib/ai/prompts/eligibility";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const userMessage = `Analyze the following immigration profile and recommend visa programs:

APPLICANT PROFILE:
- Nationality: ${body.nationality}
- Target Country: ${body.target_country}
- Purpose: ${body.purpose}
- Age: ${body.age}
- Education: ${body.education_level}${body.field_of_study ? ` in ${body.field_of_study}` : ""}
- Occupation: ${body.occupation}
- Work Experience: ${body.years_of_work_experience} years
- Language Skills: ${JSON.stringify(body.language_skills)}
- Financial Status: ${body.financial_status}
- Marital Status: ${body.marital_status}
- Dependents: ${body.dependents_count}
- Has Job Offer in Target Country: ${body.has_job_offer}
- Has Family in Target Country: ${body.has_family_in_target}
- Criminal Record: ${body.criminal_record}
- Health Issues: ${body.health_issues}

Provide a thorough analysis with scored recommendations.`;

  try {
    const resultText = await getCompletion({
      systemPrompt: ELIGIBILITY_SYSTEM_PROMPT,
      userMessage,
      model: MODEL_FAST,
      maxTokens: 4096,
      temperature: 0.3,
    });

    // Parse the JSON response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Calculate overall score
    const programs = result.recommended_programs || [];
    const overallScore = programs.length > 0
      ? Math.round(programs.reduce((sum: number, p: { score: number }) => sum + p.score, 0) / programs.length)
      : 0;

    // Save assessment
    const { data: assessment } = await supabase
      .from("imm_assessments")
      .insert({
        user_id: user.id,
        assessment_type: "eligibility",
        input_data: body,
        result_data: result,
        recommended_programs: programs,
        overall_score: overallScore,
        summary: result.summary,
      })
      .select("id")
      .single();

    return NextResponse.json({
      id: assessment?.id,
      ...result,
      overall_score: overallScore,
    });
  } catch (error) {
    console.error("Eligibility assessment error:", error);
    return NextResponse.json(
      { error: "Failed to process eligibility assessment" },
      { status: 500 },
    );
  }
}
