import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";

const TRANSLATE_SYSTEM_PROMPT = `You are a professional document translator specializing in immigration documents. You translate between English, Persian (فارسی), Kurdish (Sorani/کوردی), Arabic (العربية), Turkish, French, German, Dutch, and Spanish.

Rules:
1. Preserve all formatting, dates, names, and document structure
2. Keep legal/official terminology precise
3. Transliterate proper nouns in parentheses when translating to/from non-Latin scripts
4. Add translator notes in [brackets] for culturally specific terms
5. Maintain paragraph breaks and numbering
6. For official documents, keep field labels in the original language alongside the translation

Respond with ONLY the translated text, nothing else.`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { document_id, text, source_language, target_language } = body;

  if (!target_language) {
    return NextResponse.json({ error: "target_language required" }, { status: 400 });
  }

  let originalText = text;

  // If document_id provided, get text from document
  if (document_id && !originalText) {
    const { data: doc } = await supabase
      .from("imm_documents")
      .select("extracted_text, file_name")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.extracted_text) {
      // Download and extract
      const { data: fileData } = await supabase.storage
        .from("documents")
        .download(doc.file_name);
      if (fileData) {
        originalText = await fileData.text();
        await supabase.from("imm_documents").update({ extracted_text: originalText }).eq("id", document_id);
      }
    } else {
      originalText = doc.extracted_text;
    }
  }

  if (!originalText?.trim()) {
    return NextResponse.json({ error: "No text to translate" }, { status: 400 });
  }

  // Detect source language if not provided
  let detectedSource = source_language;
  if (!detectedSource) {
    detectedSource = await getCompletion({
      systemPrompt: "Detect the language of this text. Respond with ONLY the language code: en, fa, ku, ar, tr, fr, de, nl, es. Nothing else.",
      userMessage: originalText.slice(0, 500),
      maxTokens: 10,
    });
    detectedSource = detectedSource.trim().toLowerCase();
  }

  try {
    const translated = await getCompletion({
      systemPrompt: TRANSLATE_SYSTEM_PROMPT,
      userMessage: `Translate the following from ${detectedSource} to ${target_language}:\n\n${originalText.slice(0, 10000)}`,
      maxTokens: 4096,
      temperature: 0.2,
    });

    // Save translation if document_id provided
    if (document_id) {
      await supabase.from("imm_document_translations").insert({
        document_id,
        user_id: user.id,
        source_language: detectedSource,
        target_language,
        original_text: originalText.slice(0, 10000),
        translated_text: translated,
      });

      // Update detected language on document
      await supabase.from("imm_documents")
        .update({ detected_language: detectedSource })
        .eq("id", document_id);
    }

    return NextResponse.json({
      source_language: detectedSource,
      target_language,
      translated_text: translated,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
