import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";

const CASE_BRIEF_PROMPT = `You are a senior immigration case analyst. Generate a comprehensive case brief that would be useful for an immigration attorney reviewing this case.

Structure the brief as follows:

# IMMIGRATION CASE BRIEF

## Case Overview
- Case title, visa type, origin/target countries
- Current status and key dates

## Applicant Profile
- Demographics, education, employment
- Language skills, family situation

## Visa Program Analysis
- Selected program details
- Key requirements and how applicant meets them
- Gaps or concerns

## Document Summary
- List of submitted documents
- Document compliance status
- Missing or expiring documents

## Risk Assessment
- AI approval probability (if available)
- Positive factors
- Risk factors
- Mitigation strategies

## Timeline
- Key milestones and deadlines
- Estimated processing time

## Recommendations
- Immediate action items
- Documents to prepare
- Potential issues to address

Write in clear, professional English. Be thorough but concise. Use bullet points for readability.`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { case_id, brief_type = "standard" } = body;

  if (!case_id) {
    return NextResponse.json({ error: "case_id required" }, { status: 400 });
  }

  // Gather all case data
  const [caseResult, profileResult, docsResult, milestonesResult, assessmentsResult] = await Promise.all([
    supabase.from("imm_cases").select("*, visa_programs(*)").eq("id", case_id).eq("user_id", user.id).single(),
    supabase.from("imm_profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("imm_documents").select("file_name, category, compliance_status, compliance_notes, expiry_date, ai_analysis").eq("case_id", case_id),
    supabase.from("imm_case_milestones").select("*").eq("case_id", case_id).order("sort_order"),
    supabase.from("imm_assessments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  if (!caseResult.data) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const caseData = {
    case: caseResult.data,
    profile: profileResult.data,
    documents: docsResult.data || [],
    milestones: milestonesResult.data || [],
    assessments: assessmentsResult.data || [],
  };

  try {
    const brief = await getCompletion({
      systemPrompt: CASE_BRIEF_PROMPT,
      userMessage: `Generate a ${brief_type} case brief from this data:\n\n${JSON.stringify(caseData, null, 2)}`,
      maxTokens: 4096,
      temperature: 0.3,
    });

    // Save the brief
    const { data: saved } = await supabase.from("imm_case_briefs").insert({
      case_id,
      user_id: user.id,
      brief_type,
      content: brief,
      metadata: {
        documents_count: caseData.documents.length,
        milestones_count: caseData.milestones.length,
        generated_at: new Date().toISOString(),
      },
    }).select("id").single();

    return NextResponse.json({
      id: saved?.id,
      brief,
      brief_type,
    });
  } catch (error) {
    console.error("Case brief error:", error);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
