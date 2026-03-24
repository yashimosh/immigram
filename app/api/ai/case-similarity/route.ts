import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEmbedding } from "@/lib/ai/embeddings";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, case_id } = body;

  if (action === "embed") {
    // Generate and store embedding for a case
    if (!case_id) {
      return NextResponse.json({ error: "case_id required" }, { status: 400 });
    }

    const { data: caseData } = await supabase
      .from("imm_cases")
      .select("*, visa_programs(*)")
      .eq("id", case_id)
      .eq("user_id", user.id)
      .single();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Generate a summary for embedding
    const summaryText = await getCompletion({
      systemPrompt: "Summarize this immigration case in 2-3 sentences for similarity matching. Include nationality, target country, visa type, key qualifications, and outcome if known. Be factual and concise.",
      userMessage: JSON.stringify(caseData),
      model: MODEL_FAST,
      maxTokens: 256,
    });

    const embedding = await getEmbedding(summaryText);

    // Upsert case embedding
    await supabase.from("imm_case_embeddings").upsert({
      case_id,
      user_id: user.id,
      summary_text: summaryText,
      embedding: JSON.stringify(embedding),
    }, { onConflict: "case_id" });

    return NextResponse.json({ embedded: true, summary: summaryText });
  }

  if (action === "find_similar") {
    if (!case_id) {
      return NextResponse.json({ error: "case_id required" }, { status: 400 });
    }

    // Get the case's embedding
    const { data: caseEmb } = await supabase
      .from("imm_case_embeddings")
      .select("embedding, summary_text")
      .eq("case_id", case_id)
      .single();

    if (!caseEmb) {
      return NextResponse.json({ error: "Case not embedded yet. Call with action='embed' first." }, { status: 400 });
    }

    // Find similar cases via RPC
    const { data: results, error } = await supabase.rpc("match_similar_cases", {
      query_embedding: caseEmb.embedding,
      exclude_case_id: case_id,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error) {
      console.error("Case similarity error:", error);
      return NextResponse.json({ error: "Similarity search failed" }, { status: 500 });
    }

    // Get case details for results (anonymized — only show visa type, country, status)
    const similarCaseIds = (results || []).map((r: { case_id: string }) => r.case_id);
    const { data: cases } = await supabase
      .from("imm_cases")
      .select("id, origin_country, target_country, visa_type, status, ai_approval_score")
      .in("id", similarCaseIds);

    const enriched = (results || []).map((r: { case_id: string; summary_text: string; similarity: number }) => {
      const c = cases?.find((c) => c.id === r.case_id);
      return {
        similarity: r.similarity,
        summary: r.summary_text,
        case: c ? {
          origin_country: c.origin_country,
          target_country: c.target_country,
          visa_type: c.visa_type,
          status: c.status,
          approval_score: c.ai_approval_score,
        } : null,
      };
    });

    return NextResponse.json({ similar_cases: enriched });
  }

  return NextResponse.json({ error: "Invalid action. Use 'embed' or 'find_similar'" }, { status: 400 });
}
