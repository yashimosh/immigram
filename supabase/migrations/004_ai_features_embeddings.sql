-- =============================================================================
-- Immigram — AI Features: Embeddings, Translations, Briefs
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Document Embeddings (for semantic search)
CREATE TABLE IF NOT EXISTS imm_document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES imm_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding vector(1024),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_doc_embeddings_user ON imm_document_embeddings(user_id);
CREATE INDEX idx_doc_embeddings_document ON imm_document_embeddings(document_id);
ALTER TABLE imm_document_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own document embeddings" ON imm_document_embeddings FOR ALL USING (auth.uid() = user_id);

-- Case Embeddings (for similarity matching)
CREATE TABLE IF NOT EXISTS imm_case_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES imm_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  embedding vector(1024),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id)
);
CREATE INDEX idx_case_embeddings_user ON imm_case_embeddings(user_id);
ALTER TABLE imm_case_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own case embeddings" ON imm_case_embeddings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "All users can read case embeddings" ON imm_case_embeddings FOR SELECT USING (TRUE);

-- Document Translations
CREATE TABLE IF NOT EXISTS imm_document_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES imm_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_doc_translations_document ON imm_document_translations(document_id);
ALTER TABLE imm_document_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own translations" ON imm_document_translations FOR ALL USING (auth.uid() = user_id);

-- Case Briefs
CREATE TABLE IF NOT EXISTS imm_case_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES imm_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
  brief_type TEXT NOT NULL DEFAULT 'standard' CHECK (brief_type IN ('standard', 'legal', 'summary')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_case_briefs_case ON imm_case_briefs(case_id);
ALTER TABLE imm_case_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own briefs" ON imm_case_briefs FOR ALL USING (auth.uid() = user_id);

-- Add columns to documents
ALTER TABLE imm_documents ADD COLUMN IF NOT EXISTS detected_language TEXT;
ALTER TABLE imm_documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1024),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INTEGER,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.chunk_index,
    de.chunk_text,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM imm_document_embeddings de
  WHERE de.user_id = match_user_id
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Case similarity search function
CREATE OR REPLACE FUNCTION match_similar_cases(
  query_embedding vector(1024),
  exclude_case_id UUID DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  case_id UUID,
  summary_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.case_id,
    ce.summary_text,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM imm_case_embeddings ce
  WHERE (exclude_case_id IS NULL OR ce.case_id != exclude_case_id)
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
