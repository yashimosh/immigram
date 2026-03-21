-- =============================================================================
-- Immigram — Initial Database Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'consultant', 'admin')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public consultant profiles" ON profiles FOR SELECT USING (is_verified_consultant = TRUE);

-- ---------------------------------------------------------------------------
-- Visa Programs
-- ---------------------------------------------------------------------------
CREATE TABLE visa_programs (
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

CREATE INDEX idx_visa_programs_country ON visa_programs(country_code);
CREATE INDEX idx_visa_programs_type ON visa_programs(visa_type);

ALTER TABLE visa_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visa programs are publicly readable" ON visa_programs FOR SELECT USING (TRUE);

-- ---------------------------------------------------------------------------
-- Cases
-- ---------------------------------------------------------------------------
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id),
  visa_program_id UUID REFERENCES visa_programs(id),
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

CREATE INDEX idx_cases_user ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Consultants can view assigned cases" ON cases FOR SELECT USING (auth.uid() = consultant_id);

-- ---------------------------------------------------------------------------
-- Case Events
-- ---------------------------------------------------------------------------
CREATE TABLE case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_events_case ON case_events(case_id);

ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view events for own cases" ON case_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = case_events.case_id AND cases.user_id = auth.uid()));
CREATE POLICY "Users can insert events for own cases" ON case_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.id = case_events.case_id AND cases.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Case Milestones
-- ---------------------------------------------------------------------------
CREATE TABLE case_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage milestones for own cases" ON case_milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = case_milestones.case_id AND cases.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
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
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_case ON documents(case_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Consultants can view documents for assigned cases" ON documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.consultant_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('eligibility', 'outcome_prediction', 'timeline')),
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  recommended_programs JSONB DEFAULT '[]',
  overall_score NUMERIC(5,2),
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_user ON assessments(user_id);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own assessments" ON assessments FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- AI Conversations
-- ---------------------------------------------------------------------------
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  context_type TEXT DEFAULT 'general' CHECK (context_type IN (
    'general', 'eligibility', 'document_help', 'form_filling', 'cover_letter', 'timeline'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage messages in own conversations" ON ai_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Community
-- ---------------------------------------------------------------------------
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community posts are publicly readable" ON community_posts FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes_count INTEGER DEFAULT 0,
  is_accepted_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are publicly readable" ON community_comments FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are publicly readable" ON community_votes FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can vote" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own votes" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_notifications_user ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'consultation', 'document_review', 'one_time')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Consultant Bookings
-- ---------------------------------------------------------------------------
CREATE TABLE consultant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  case_id UUID REFERENCES cases(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_url TEXT,
  notes TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE consultant_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants can view own bookings" ON consultant_bookings FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Consultants can view assigned bookings" ON consultant_bookings FOR SELECT USING (auth.uid() = consultant_id);
CREATE POLICY "Applicants can create bookings" ON consultant_bookings FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- ---------------------------------------------------------------------------
-- Triggers: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_visa_programs BEFORE UPDATE ON visa_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_cases BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_ai_conversations BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_community_posts BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_community_comments BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: auto-create user record on auth signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
