import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEmbedding, chunkText, getEmbeddings } from "@/lib/ai/embeddings";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, query, document_id } = body;

  if (action === "index") {
    // Index a document: extract text, chunk, embed, store
    if (!document_id) {
      return NextResponse.json({ error: "document_id required" }, { status: 400 });
    }

    const { data: doc } = await supabase
      .from("imm_documents")
      .select("*")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get document text (from extracted_text or download)
    let text = doc.extracted_text;
    if (!text) {
      const { data: fileData } = await supabase.storage
        .from("documents")
        .download(doc.storage_path);
      if (!fileData) {
        return NextResponse.json({ error: "Failed to download" }, { status: 500 });
      }
      text = await fileData.text();
      // Save extracted text
      await supabase.from("imm_documents").update({ extracted_text: text }).eq("id", document_id);
    }

    // Chunk and embed
    const chunks = chunkText(text);
    const embeddings = await getEmbeddings(chunks);

    // Delete old embeddings for this doc
    await supabase.from("imm_document_embeddings").delete().eq("document_id", document_id);

    // Insert new embeddings
    const rows = chunks.map((chunk, i) => ({
      document_id,
      user_id: user.id,
      chunk_index: i,
      chunk_text: chunk,
      embedding: JSON.stringify(embeddings[i]),
    }));

    await supabase.from("imm_document_embeddings").insert(rows);

    return NextResponse.json({ indexed: chunks.length });
  }

  if (action === "search") {
    if (!query?.trim()) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    const queryEmbedding = await getEmbedding(query);

    // Use Supabase RPC for vector similarity search
    const { data: results, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_user_id: user.id,
      match_threshold: 0.3,
      match_count: 10,
    });

    if (error) {
      console.error("Semantic search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    return NextResponse.json({ results: results || [] });
  }

  return NextResponse.json({ error: "Invalid action. Use 'index' or 'search'" }, { status: 400 });
}
