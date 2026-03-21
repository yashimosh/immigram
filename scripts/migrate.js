// Run imm_ prefixed migration on self-hosted Supabase via /pg/query endpoint
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzM5OTg1NDIsImV4cCI6MTkzMTY3ODU0Mn0.wAH05sXQeBZZIHSDm8Yku9pEaN_cDWWMa58D4n6biOc";
const BASE_URL = "https://db.yashimosh.com";

async function runSQL(sql, label) {
  const res = await fetch(`${BASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAIL [${label}]:`, text);
    throw new Error(`Migration step failed: ${label}`);
  }
  console.log(`OK [${label}]`);
  return text;
}

async function main() {
  // 1. Extension
  await runSQL(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`, "uuid-ossp extension");

  // 2. imm_users
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'consultant', 'admin')),
      subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
      subscription_expires_at TIMESTAMPTZ,
      preferred_language TEXT DEFAULT 'en',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_users ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_users' AND policyname='imm_users_select_own') THEN
        CREATE POLICY "imm_users_select_own" ON imm_users FOR SELECT USING (auth.uid() = id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_users' AND policyname='imm_users_update_own') THEN
        CREATE POLICY "imm_users_update_own" ON imm_users FOR UPDATE USING (auth.uid() = id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_users' AND policyname='imm_users_insert_own') THEN
        CREATE POLICY "imm_users_insert_own" ON imm_users FOR INSERT WITH CHECK (auth.uid() = id);
      END IF;
    END $$;
  `, "imm_users");

  // 3. imm_profiles
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      date_of_birth DATE,
      nationality TEXT,
      country_of_residence TEXT,
      target_countries TEXT[] DEFAULT '{}',
      languages_spoken JSONB DEFAULT '[]',
      education_level TEXT,
      occupation TEXT,
      years_of_work_experience INTEGER,
      marital_status TEXT,
      dependents_count INTEGER DEFAULT 0,
      passport_country TEXT,
      passport_expiry DATE,
      bio TEXT,
      is_verified_consultant BOOLEAN DEFAULT FALSE,
      consultancy_name TEXT,
      license_number TEXT,
      specializations TEXT[] DEFAULT '{}',
      hourly_rate_usd NUMERIC(10,2),
      consultation_languages TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_profiles ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_profiles' AND policyname='imm_profiles_select_own') THEN
        CREATE POLICY "imm_profiles_select_own" ON imm_profiles FOR SELECT USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_profiles' AND policyname='imm_profiles_update_own') THEN
        CREATE POLICY "imm_profiles_update_own" ON imm_profiles FOR UPDATE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_profiles' AND policyname='imm_profiles_insert_own') THEN
        CREATE POLICY "imm_profiles_insert_own" ON imm_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_profiles' AND policyname='imm_profiles_public_consultants') THEN
        CREATE POLICY "imm_profiles_public_consultants" ON imm_profiles FOR SELECT USING (is_verified_consultant = TRUE);
      END IF;
    END $$;
  `, "imm_profiles");

  // 4. imm_visa_programs
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_visa_programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      country_code TEXT NOT NULL,
      country_name TEXT NOT NULL,
      visa_type TEXT NOT NULL,
      program_name TEXT NOT NULL,
      program_code TEXT,
      description TEXT,
      eligibility_summary TEXT,
      requirements JSONB DEFAULT '{}',
      processing_time_days_min INTEGER,
      processing_time_days_max INTEGER,
      cost_estimate_usd NUMERIC(10,2),
      success_rate NUMERIC(5,2),
      annual_quota INTEGER,
      documents_required TEXT[] DEFAULT '{}',
      official_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      last_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_visa_programs_country ON imm_visa_programs(country_code);
    CREATE INDEX IF NOT EXISTS idx_imm_visa_programs_type ON imm_visa_programs(visa_type);
    ALTER TABLE imm_visa_programs ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_visa_programs' AND policyname='imm_visa_programs_public_read') THEN
        CREATE POLICY "imm_visa_programs_public_read" ON imm_visa_programs FOR SELECT USING (TRUE);
      END IF;
    END $$;
  `, "imm_visa_programs");

  // 5. imm_cases
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      consultant_id UUID REFERENCES imm_users(id),
      visa_program_id UUID REFERENCES imm_visa_programs(id),
      title TEXT NOT NULL,
      case_number TEXT,
      origin_country TEXT NOT NULL,
      target_country TEXT NOT NULL,
      visa_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'documents_pending', 'under_review',
        'submitted', 'processing', 'additional_info_requested',
        'interview_scheduled', 'approved', 'denied', 'appealing', 'closed'
      )),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      ai_approval_score NUMERIC(5,2),
      ai_risk_factors JSONB DEFAULT '[]',
      target_date DATE,
      submitted_date DATE,
      decision_date DATE,
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_cases_user ON imm_cases(user_id);
    CREATE INDEX IF NOT EXISTS idx_imm_cases_status ON imm_cases(status);
    ALTER TABLE imm_cases ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_cases' AND policyname='imm_cases_select_own') THEN
        CREATE POLICY "imm_cases_select_own" ON imm_cases FOR SELECT USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_cases' AND policyname='imm_cases_insert_own') THEN
        CREATE POLICY "imm_cases_insert_own" ON imm_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_cases' AND policyname='imm_cases_update_own') THEN
        CREATE POLICY "imm_cases_update_own" ON imm_cases FOR UPDATE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_cases' AND policyname='imm_cases_delete_own') THEN
        CREATE POLICY "imm_cases_delete_own" ON imm_cases FOR DELETE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_cases' AND policyname='imm_cases_consultant_view') THEN
        CREATE POLICY "imm_cases_consultant_view" ON imm_cases FOR SELECT USING (auth.uid() = consultant_id);
      END IF;
    END $$;
  `, "imm_cases");

  // 6. imm_case_events
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_case_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES imm_cases(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      old_status TEXT,
      new_status TEXT,
      created_by UUID REFERENCES imm_users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_case_events_case ON imm_case_events(case_id);
    ALTER TABLE imm_case_events ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_case_events' AND policyname='imm_case_events_select') THEN
        CREATE POLICY "imm_case_events_select" ON imm_case_events FOR SELECT
          USING (EXISTS (SELECT 1 FROM imm_cases WHERE imm_cases.id = imm_case_events.case_id AND imm_cases.user_id = auth.uid()));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_case_events' AND policyname='imm_case_events_insert') THEN
        CREATE POLICY "imm_case_events_insert" ON imm_case_events FOR INSERT
          WITH CHECK (EXISTS (SELECT 1 FROM imm_cases WHERE imm_cases.id = imm_case_events.case_id AND imm_cases.user_id = auth.uid()));
      END IF;
    END $$;
  `, "imm_case_events");

  // 7. imm_case_milestones
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_case_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES imm_cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE,
      completed_at TIMESTAMPTZ,
      is_completed BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      ai_generated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_case_milestones ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_case_milestones' AND policyname='imm_case_milestones_all') THEN
        CREATE POLICY "imm_case_milestones_all" ON imm_case_milestones FOR ALL
          USING (EXISTS (SELECT 1 FROM imm_cases WHERE imm_cases.id = imm_case_milestones.case_id AND imm_cases.user_id = auth.uid()));
      END IF;
    END $$;
  `, "imm_case_milestones");

  // 8. imm_documents
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      case_id UUID REFERENCES imm_cases(id) ON DELETE SET NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN (
        'passport', 'visa', 'birth_certificate', 'marriage_certificate',
        'education', 'employment', 'financial', 'medical',
        'police_clearance', 'photo', 'cover_letter', 'form',
        'supporting', 'correspondence', 'other'
      )),
      ai_analysis JSONB,
      compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'issues_found', 'expired')),
      compliance_notes TEXT,
      expiry_date DATE,
      is_verified BOOLEAN DEFAULT FALSE,
      verified_by UUID REFERENCES imm_users(id),
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_documents_user ON imm_documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_imm_documents_case ON imm_documents(case_id);
    ALTER TABLE imm_documents ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_documents' AND policyname='imm_documents_own') THEN
        CREATE POLICY "imm_documents_own" ON imm_documents FOR ALL USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_documents' AND policyname='imm_documents_consultant_view') THEN
        CREATE POLICY "imm_documents_consultant_view" ON imm_documents FOR SELECT
          USING (EXISTS (SELECT 1 FROM imm_cases WHERE imm_cases.id = imm_documents.case_id AND imm_cases.consultant_id = auth.uid()));
      END IF;
    END $$;
  `, "imm_documents");

  // 9. imm_assessments
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      assessment_type TEXT NOT NULL CHECK (assessment_type IN ('eligibility', 'outcome_prediction', 'timeline')),
      input_data JSONB NOT NULL,
      result_data JSONB NOT NULL,
      recommended_programs JSONB DEFAULT '[]',
      overall_score NUMERIC(5,2),
      summary TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_assessments_user ON imm_assessments(user_id);
    ALTER TABLE imm_assessments ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_assessments' AND policyname='imm_assessments_own') THEN
        CREATE POLICY "imm_assessments_own" ON imm_assessments FOR ALL USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_assessments");

  // 10. imm_ai_conversations + imm_ai_messages
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_ai_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      case_id UUID REFERENCES imm_cases(id) ON DELETE SET NULL,
      title TEXT NOT NULL DEFAULT 'New Conversation',
      context_type TEXT DEFAULT 'general' CHECK (context_type IN (
        'general', 'eligibility', 'document_help', 'form_filling', 'cover_letter', 'timeline'
      )),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_ai_conversations ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_ai_conversations' AND policyname='imm_ai_conversations_own') THEN
        CREATE POLICY "imm_ai_conversations_own" ON imm_ai_conversations FOR ALL USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_ai_conversations");

  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_ai_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES imm_ai_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_ai_messages_conv ON imm_ai_messages(conversation_id);
    ALTER TABLE imm_ai_messages ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_ai_messages' AND policyname='imm_ai_messages_own') THEN
        CREATE POLICY "imm_ai_messages_own" ON imm_ai_messages FOR ALL
          USING (EXISTS (SELECT 1 FROM imm_ai_conversations WHERE imm_ai_conversations.id = imm_ai_messages.conversation_id AND imm_ai_conversations.user_id = auth.uid()));
      END IF;
    END $$;
  `, "imm_ai_messages");

  // 11. imm_community_posts + comments + votes
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_community_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      category TEXT NOT NULL CHECK (category IN ('question', 'success_story', 'discussion', 'tip', 'news')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      country_tags TEXT[] DEFAULT '{}',
      visa_tags TEXT[] DEFAULT '{}',
      upvotes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      is_pinned BOOLEAN DEFAULT FALSE,
      is_answered BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_community_posts ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_posts' AND policyname='imm_community_posts_public_read') THEN
        CREATE POLICY "imm_community_posts_public_read" ON imm_community_posts FOR SELECT USING (TRUE);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_posts' AND policyname='imm_community_posts_insert') THEN
        CREATE POLICY "imm_community_posts_insert" ON imm_community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_posts' AND policyname='imm_community_posts_update') THEN
        CREATE POLICY "imm_community_posts_update" ON imm_community_posts FOR UPDATE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_posts' AND policyname='imm_community_posts_delete') THEN
        CREATE POLICY "imm_community_posts_delete" ON imm_community_posts FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_community_posts");

  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_community_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL REFERENCES imm_community_posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES imm_community_comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      upvotes_count INTEGER DEFAULT 0,
      is_accepted_answer BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_community_comments ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_comments' AND policyname='imm_community_comments_public_read') THEN
        CREATE POLICY "imm_community_comments_public_read" ON imm_community_comments FOR SELECT USING (TRUE);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_comments' AND policyname='imm_community_comments_insert') THEN
        CREATE POLICY "imm_community_comments_insert" ON imm_community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_comments' AND policyname='imm_community_comments_update') THEN
        CREATE POLICY "imm_community_comments_update" ON imm_community_comments FOR UPDATE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_comments' AND policyname='imm_community_comments_delete') THEN
        CREATE POLICY "imm_community_comments_delete" ON imm_community_comments FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_community_comments");

  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_community_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      post_id UUID REFERENCES imm_community_posts(id) ON DELETE CASCADE,
      comment_id UUID REFERENCES imm_community_comments(id) ON DELETE CASCADE,
      vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, post_id),
      UNIQUE(user_id, comment_id)
    );
    ALTER TABLE imm_community_votes ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_votes' AND policyname='imm_community_votes_public_read') THEN
        CREATE POLICY "imm_community_votes_public_read" ON imm_community_votes FOR SELECT USING (TRUE);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_votes' AND policyname='imm_community_votes_insert') THEN
        CREATE POLICY "imm_community_votes_insert" ON imm_community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_community_votes' AND policyname='imm_community_votes_delete') THEN
        CREATE POLICY "imm_community_votes_delete" ON imm_community_votes FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_community_votes");

  // 12. imm_notifications
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN (
        'case_status_changed', 'document_expiring', 'milestone_due',
        'assessment_complete', 'new_message', 'community_reply',
        'consultant_assigned', 'payment_received', 'system'
      )),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      data JSONB,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_imm_notifications_user ON imm_notifications(user_id);
    ALTER TABLE imm_notifications ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_notifications' AND policyname='imm_notifications_select') THEN
        CREATE POLICY "imm_notifications_select" ON imm_notifications FOR SELECT USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_notifications' AND policyname='imm_notifications_update') THEN
        CREATE POLICY "imm_notifications_update" ON imm_notifications FOR UPDATE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_notifications");

  // 13. imm_payments
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES imm_users(id) ON DELETE CASCADE,
      amount_usd NUMERIC(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'consultation', 'document_review', 'one_time')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      stripe_payment_intent_id TEXT,
      description TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_payments ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_payments' AND policyname='imm_payments_select') THEN
        CREATE POLICY "imm_payments_select" ON imm_payments FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "imm_payments");

  // 14. imm_consultant_bookings
  await runSQL(`
    CREATE TABLE IF NOT EXISTS imm_consultant_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      applicant_id UUID NOT NULL REFERENCES imm_users(id),
      consultant_id UUID NOT NULL REFERENCES imm_users(id),
      case_id UUID REFERENCES imm_cases(id),
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      meeting_url TEXT,
      notes TEXT,
      payment_id UUID REFERENCES imm_payments(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE imm_consultant_bookings ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_consultant_bookings' AND policyname='imm_bookings_applicant') THEN
        CREATE POLICY "imm_bookings_applicant" ON imm_consultant_bookings FOR SELECT USING (auth.uid() = applicant_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_consultant_bookings' AND policyname='imm_bookings_consultant') THEN
        CREATE POLICY "imm_bookings_consultant" ON imm_consultant_bookings FOR SELECT USING (auth.uid() = consultant_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='imm_consultant_bookings' AND policyname='imm_bookings_insert') THEN
        CREATE POLICY "imm_bookings_insert" ON imm_consultant_bookings FOR INSERT WITH CHECK (auth.uid() = applicant_id);
      END IF;
    END $$;
  `, "imm_consultant_bookings");

  // 15. Triggers — use imm_ prefixed names to avoid conflicts
  await runSQL(`
    CREATE OR REPLACE FUNCTION imm_update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_users') THEN
        CREATE TRIGGER imm_set_updated_at_users BEFORE UPDATE ON imm_users FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_profiles') THEN
        CREATE TRIGGER imm_set_updated_at_profiles BEFORE UPDATE ON imm_profiles FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_visa_programs') THEN
        CREATE TRIGGER imm_set_updated_at_visa_programs BEFORE UPDATE ON imm_visa_programs FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_cases') THEN
        CREATE TRIGGER imm_set_updated_at_cases BEFORE UPDATE ON imm_cases FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_documents') THEN
        CREATE TRIGGER imm_set_updated_at_documents BEFORE UPDATE ON imm_documents FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_ai_conversations') THEN
        CREATE TRIGGER imm_set_updated_at_ai_conversations BEFORE UPDATE ON imm_ai_conversations FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_community_posts') THEN
        CREATE TRIGGER imm_set_updated_at_community_posts BEFORE UPDATE ON imm_community_posts FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_set_updated_at_community_comments') THEN
        CREATE TRIGGER imm_set_updated_at_community_comments BEFORE UPDATE ON imm_community_comments FOR EACH ROW EXECUTE FUNCTION imm_update_updated_at();
      END IF;
    END $$;
  `, "imm_triggers");

  // 16. Auth trigger — use DIFFERENT name from existing on_auth_user_created
  await runSQL(`
    CREATE OR REPLACE FUNCTION imm_handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.imm_users (id, email)
      VALUES (NEW.id, NEW.email)
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'imm_on_auth_user_created') THEN
        CREATE TRIGGER imm_on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION imm_handle_new_user();
      END IF;
    END $$;
  `, "imm_auth_trigger");

  console.log("\n=== Migration complete! ===");
}

main().catch(console.error);
