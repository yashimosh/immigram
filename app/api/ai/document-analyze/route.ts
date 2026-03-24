import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, MODEL_FAST } from "@/lib/ai/client";
import { DOCUMENT_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/document-analysis";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { document_id } = body;

  if (!document_id) {
    return NextResponse.json({ error: "document_id is required" }, { status: 400 });
  }

  // Get document metadata
  const { data: doc } = await supabase
    .from("imm_documents")
    .select("*")
    .eq("id", document_id)
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Download file from Supabase Storage
  const { data: fileData } = await supabase.storage
    .from("documents")
    .download(doc.storage_path);

  if (!fileData) {
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }

  const client = getAIClient();

  try {
    const isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].some(
      (t) => doc.file_type.includes(t) || doc.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i),
    );

    let messages: { role: "system" | "user"; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }[];

    if (isImage) {
      // Use vision for images — qwen3.5:4b supports vision + multilingual
      const buffer = await fileData.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mediaType = doc.file_type.includes("png") ? "image/png" : "image/jpeg";

      messages = [
        { role: "system", content: DOCUMENT_ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${base64}` },
            },
            {
              type: "text",
              text: `Analyze this immigration document. The file is named "${doc.file_name}" and categorized as "${doc.category}".`,
            },
          ],
        },
      ];
    } else {
      // For PDFs and other text docs, extract text
      const text = await fileData.text();
      messages = [
        { role: "system", content: DOCUMENT_ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this immigration document. The file is named "${doc.file_name}" and categorized as "${doc.category}".\n\nDocument content:\n${text.slice(0, 10000)}`,
        },
      ];
    }

    const model = MODEL_FAST;

    const response = await client.chat.completions.create({
      model,
      max_tokens: 2048,
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
    });

    const resultText = response.choices[0]?.message?.content ?? "";

    // Parse JSON
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse analysis" }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Update document with analysis
    const complianceStatus =
      analysis.completeness_score >= 80
        ? "compliant"
        : analysis.issues?.length > 0
        ? "issues_found"
        : "pending";

    await supabase
      .from("imm_documents")
      .update({
        ai_analysis: analysis,
        compliance_status: complianceStatus,
        compliance_notes: analysis.summary,
      })
      .eq("id", document_id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 },
    );
  }
}
