// =============================================================================
// Immigram — Constants
// =============================================================================

export const APP_NAME = "Immigram";

// ---------------------------------------------------------------------------
// Countries (Top 10 supported)
// ---------------------------------------------------------------------------

export const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
] as const;

export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number]["code"];

// ---------------------------------------------------------------------------
// Visa types
// ---------------------------------------------------------------------------

export const VISA_TYPES = [
  { value: "work", label: "Work Visa" },
  { value: "study", label: "Study Visa" },
  { value: "family", label: "Family Reunion" },
  { value: "investment", label: "Investment / Business" },
  { value: "refugee", label: "Refugee / Asylum" },
  { value: "tourist", label: "Tourist Visa" },
  { value: "permanent_residence", label: "Permanent Residence" },
  { value: "citizenship", label: "Citizenship" },
] as const;

export type VisaType = (typeof VISA_TYPES)[number]["value"];

// ---------------------------------------------------------------------------
// User roles
// ---------------------------------------------------------------------------

export const USER_ROLES = ["applicant", "consultant", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ---------------------------------------------------------------------------
// Subscription tiers
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_TIERS = [
  { value: "free", label: "Free", priceUsd: 0 },
  { value: "starter", label: "Starter", priceUsd: 19 },
  { value: "professional", label: "Professional", priceUsd: 49 },
  { value: "enterprise", label: "Enterprise", priceUsd: 149 },
] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]["value"];

// ---------------------------------------------------------------------------
// Case statuses
// ---------------------------------------------------------------------------

export const CASE_STATUSES = [
  { value: "draft", label: "Draft", color: "neutral" },
  { value: "in_progress", label: "In Progress", color: "blue" },
  { value: "documents_pending", label: "Documents Pending", color: "amber" },
  { value: "under_review", label: "Under Review", color: "purple" },
  { value: "submitted", label: "Submitted", color: "teal" },
  { value: "processing", label: "Processing", color: "blue" },
  { value: "additional_info_requested", label: "Info Requested", color: "amber" },
  { value: "interview_scheduled", label: "Interview Scheduled", color: "purple" },
  { value: "approved", label: "Approved", color: "green" },
  { value: "denied", label: "Denied", color: "red" },
  { value: "appealing", label: "Appealing", color: "amber" },
  { value: "closed", label: "Closed", color: "neutral" },
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number]["value"];

// ---------------------------------------------------------------------------
// Document categories
// ---------------------------------------------------------------------------

export const DOCUMENT_CATEGORIES = [
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "marriage_certificate", label: "Marriage Certificate" },
  { value: "education", label: "Education" },
  { value: "employment", label: "Employment" },
  { value: "financial", label: "Financial" },
  { value: "medical", label: "Medical" },
  { value: "police_clearance", label: "Police Clearance" },
  { value: "photo", label: "Photo" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "form", label: "Form" },
  { value: "supporting", label: "Supporting Document" },
  { value: "correspondence", label: "Correspondence" },
  { value: "other", label: "Other" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

// ---------------------------------------------------------------------------
// Education levels
// ---------------------------------------------------------------------------

export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate / PhD" },
  { value: "other", label: "Other" },
] as const;

// ---------------------------------------------------------------------------
// Community post categories
// ---------------------------------------------------------------------------

export const COMMUNITY_CATEGORIES = [
  { value: "question", label: "Question" },
  { value: "success_story", label: "Success Story" },
  { value: "discussion", label: "Discussion" },
  { value: "tip", label: "Tip" },
  { value: "news", label: "News" },
] as const;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const APP_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Cases", href: "/cases", icon: "Briefcase" },
  { label: "Documents", href: "/documents", icon: "FileText" },
  { label: "Assessments", href: "/assessments", icon: "ClipboardCheck" },
  { label: "AI Chat", href: "/chat", icon: "MessageSquare" },
  { label: "Clients", href: "/clients", icon: "UsersRound" },
  { label: "Community", href: "/community", icon: "Users" },
  { label: "Consultants", href: "/consultants", icon: "UserCheck" },
  { label: "Tools", href: "/tools", icon: "Wand2" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;
