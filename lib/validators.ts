import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["applicant", "consultant"]).default("applicant"),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  country_of_residence: z.string().optional(),
  target_countries: z.array(z.string()).default([]),
  education_level: z.string().optional(),
  occupation: z.string().optional(),
  years_of_work_experience: z.number().int().min(0).optional(),
  marital_status: z.string().optional(),
  dependents_count: z.number().int().min(0).default(0),
  passport_country: z.string().optional(),
  passport_expiry: z.string().optional(),
  bio: z.string().max(500).optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Case
// ---------------------------------------------------------------------------

export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  origin_country: z.string().min(2, "Origin country is required"),
  target_country: z.string().min(2, "Target country is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_program_id: z.string().uuid().optional(),
  target_date: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

// ---------------------------------------------------------------------------
// Eligibility Assessment
// ---------------------------------------------------------------------------

export const eligibilityInputSchema = z.object({
  nationality: z.string().min(2),
  target_country: z.string().min(2),
  purpose: z.enum(["work", "study", "family", "investment", "refugee", "tourist", "permanent_residence", "citizenship"]),
  education_level: z.string(),
  field_of_study: z.string().optional(),
  years_of_work_experience: z.number().int().min(0),
  occupation: z.string(),
  language_skills: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(["basic", "intermediate", "advanced", "fluent", "native"]),
  })),
  financial_status: z.enum(["limited", "moderate", "comfortable", "wealthy"]),
  marital_status: z.string(),
  dependents_count: z.number().int().min(0),
  has_job_offer: z.boolean(),
  has_family_in_target: z.boolean(),
  criminal_record: z.boolean(),
  health_issues: z.boolean(),
  age: z.number().int().min(16).max(99),
});
export type EligibilityInput = z.infer<typeof eligibilityInputSchema>;

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

export const createPostSchema = z.object({
  category: z.enum(["question", "success_story", "discussion", "tip", "news"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  country_tags: z.array(z.string()).default([]),
  visa_tags: z.array(z.string()).default([]),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  parent_id: z.string().uuid().optional(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const chatMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1, "Message cannot be empty"),
  context_type: z.enum(["general", "eligibility", "document_help", "form_filling", "cover_letter", "timeline"]).default("general"),
  case_id: z.string().uuid().optional(),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ---------------------------------------------------------------------------
// Document Upload
// ---------------------------------------------------------------------------

export const documentUploadSchema = z.object({
  category: z.enum([
    "passport", "visa", "birth_certificate", "marriage_certificate",
    "education", "employment", "financial", "medical",
    "police_clearance", "photo", "cover_letter", "form",
    "supporting", "correspondence", "other",
  ]),
  case_id: z.string().uuid().optional(),
});
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
