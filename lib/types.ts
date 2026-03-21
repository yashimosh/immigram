// =============================================================================
// Immigram — TypeScript Types
// =============================================================================

// ---------------------------------------------------------------------------
// Users & Profiles
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: "applicant" | "consultant" | "admin";
  subscription_tier: "free" | "starter" | "professional" | "enterprise";
  subscription_expires_at: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  target_countries: string[];
  languages_spoken: { code: string; proficiency: string }[];
  education_level: string | null;
  occupation: string | null;
  years_of_work_experience: number | null;
  marital_status: string | null;
  dependents_count: number;
  passport_country: string | null;
  passport_expiry: string | null;
  bio: string | null;
  is_verified_consultant: boolean;
  consultancy_name: string | null;
  license_number: string | null;
  specializations: string[];
  hourly_rate_usd: number | null;
  consultation_languages: string[];
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "applicant" | "consultant" | "admin";
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

// ---------------------------------------------------------------------------
// Visa Programs
// ---------------------------------------------------------------------------

export interface VisaProgram {
  id: string;
  country_code: string;
  country_name: string;
  visa_type: string;
  program_name: string;
  program_code: string | null;
  description: string | null;
  eligibility_summary: string | null;
  requirements: Record<string, unknown>;
  processing_time_days_min: number | null;
  processing_time_days_max: number | null;
  cost_estimate_usd: number | null;
  success_rate: number | null;
  annual_quota: number | null;
  documents_required: string[];
  official_url: string | null;
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export interface Case {
  id: string;
  user_id: string;
  consultant_id: string | null;
  visa_program_id: string | null;
  title: string;
  case_number: string | null;
  origin_country: string;
  target_country: string;
  visa_type: string;
  status: string;
  priority: string;
  ai_approval_score: number | null;
  ai_risk_factors: unknown[];
  target_date: string | null;
  submitted_date: string | null;
  decision_date: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  event_type: string;
  title: string;
  description: string | null;
  old_status: string | null;
  new_status: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CaseMilestone {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  is_completed: boolean;
  sort_order: number;
  ai_generated: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface Document {
  id: string;
  user_id: string;
  case_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  category: string;
  ai_analysis: DocumentAnalysis | null;
  compliance_status: string;
  compliance_notes: string | null;
  expiry_date: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentAnalysis {
  extracted_fields: Record<string, string>;
  completeness_score: number;
  issues: string[];
  suggestions: string[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export interface Assessment {
  id: string;
  user_id: string;
  assessment_type: "eligibility" | "outcome_prediction" | "timeline";
  input_data: Record<string, unknown>;
  result_data: EligibilityResult | PredictionResult | TimelineResult;
  recommended_programs: RecommendedProgram[];
  overall_score: number | null;
  summary: string | null;
  created_at: string;
}

export interface RecommendedProgram {
  visa_program_id: string;
  program_name: string;
  program_code: string;
  country: string;
  score: number;
  reasoning: string;
  requirements_met: string[];
  requirements_unmet: string[];
  next_steps: string[];
}

export interface EligibilityResult {
  recommended_programs: RecommendedProgram[];
  summary: string;
  alternative_countries: { country: string; reason: string }[];
}

export interface PredictionResult {
  approval_probability: number;
  confidence: number;
  positive_factors: string[];
  risk_factors: string[];
  recommendations: string[];
}

export interface TimelineResult {
  milestones: {
    title: string;
    description: string;
    estimated_date: string;
    duration_days: number;
  }[];
  total_estimated_days: number;
  summary: string;
}

// ---------------------------------------------------------------------------
// AI Conversations
// ---------------------------------------------------------------------------

export interface AIConversation {
  id: string;
  user_id: string;
  case_id: string | null;
  title: string;
  context_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

export interface CommunityPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  country_tags: string[];
  visa_tags: string[];
  upvotes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: { first_name: string; last_name: string; avatar_url: string | null };
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes_count: number;
  is_accepted_answer: boolean;
  created_at: string;
  updated_at: string;
  author?: { first_name: string; last_name: string; avatar_url: string | null };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Payments & Bookings
// ---------------------------------------------------------------------------

export interface Payment {
  id: string;
  user_id: string;
  amount_usd: number;
  currency: string;
  payment_type: string;
  status: string;
  stripe_payment_intent_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConsultantBooking {
  id: string;
  applicant_id: string;
  consultant_id: string;
  case_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  meeting_url: string | null;
  notes: string | null;
  payment_id: string | null;
  created_at: string;
}
