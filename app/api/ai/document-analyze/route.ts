import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, MODEL_SMART } from "@/lib/ai/client";
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

  const client = getAnthropicClient();

  try {
    const isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].some(
      (t) => doc.file_type.includes(t) || doc.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i),
    );

    let response;

    if (isImage) {
      // Use vision for images
      const buffer = await fileData.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mediaType = doc.file_type.includes("png") ? "image/png" : "image/jpeg";

      response = await client.messages.create({
        model: MODEL_SMART,
        max_tokens: 2048,
        system: DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `Analyze this immigration document. The file is named "${doc.file_name}" and categorized as "${doc.category}".`,
              },
            ],
          },
        ],
      });
    } else {
      // For PDFs and other text docs, extract text
      const text = await fileData.text();
      response = await client.messages.create({
        model: MODEL_SMART,
        max_tokens: 2048,
        system: DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyze this immigration document. The file is named "${doc.file_name}" and categorized as "${doc.category}".\n\nDocument content:\n${text.slice(0, 10000)}`,
          },
        ],
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    const resultText = textBlock?.text ?? "";

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
