import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  FileSearch,
  MessageSquare,
  Briefcase,
  Users,
  UserCheck,
  ArrowRight,
  Sparkles,
  FileText,
  Bot,
  Shield,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Immigram's AI-powered features: eligibility checker, document analyzer, smart chatbot, case tracking, and more.",
};

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "AI Eligibility Checker",
    description:
      "Our intelligent assessment engine evaluates your profile against 50+ visa programs across 10+ countries. Get instant eligibility scores, detailed breakdowns of requirements you meet, and actionable recommendations to improve your chances.",
    highlights: [
      "50+ visa programs analyzed",
      "Instant eligibility scoring",
      "Gap analysis & recommendations",
      "Comparison across countries",
    ],
  },
  {
    icon: FileSearch,
    title: "Document Analyzer",
    description:
      "Upload your immigration documents and let our AI review them for completeness, accuracy, and compliance. Get detailed feedback on issues that could cause delays or rejections, plus suggestions for improvement.",
    highlights: [
      "Completeness verification",
      "Error & inconsistency detection",
      "Compliance checking",
      "Improvement suggestions",
    ],
  },
  {
    icon: Bot,
    title: "Smart AI Chatbot",
    description:
      "Get instant, accurate answers to your immigration questions 24/7. Our AI assistant is trained on the latest immigration laws, policies, and procedures across supported countries and updated regularly.",
    highlights: [
      "24/7 instant responses",
      "Up-to-date policy knowledge",
      "Multi-language support",
      "Context-aware follow-ups",
    ],
  },
  {
    icon: Briefcase,
    title: "Case Tracking",
    description:
      "Track every step of your immigration case in one place. From initial assessment through final decision, get real-time status updates, deadline reminders, and a clear view of what comes next.",
    highlights: [
      "Real-time status tracking",
      "Deadline & reminder alerts",
      "Document checklist management",
      "Timeline visualization",
    ],
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with a global community of people navigating immigration. Share experiences, ask questions, get advice from those who have been through the process, and stay informed about policy changes.",
    highlights: [
      "Discussion forums by country",
      "Experience sharing",
      "Policy update alerts",
      "Peer support network",
    ],
  },
  {
    icon: UserCheck,
    title: "Consultant Network",
    description:
      "When you need professional guidance, book consultations with verified immigration lawyers and consultants. Browse profiles, read reviews, and schedule sessions directly through the platform.",
    highlights: [
      "Verified professionals",
      "In-app booking & video calls",
      "Reviews & ratings",
      "Specialty matching",
    ],
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Generate professionally crafted immigration cover letters tailored to your specific visa type and personal circumstances. Our AI drafts compelling narratives that highlight your strengths.",
    highlights: [
      "Visa-specific templates",
      "Personalized content",
      "Multiple draft variations",
      "Professional formatting",
    ],
  },
  {
    icon: Shield,
    title: "Form Auto-Fill Assistant",
    description:
      "Save hours on paperwork. Our form assistant helps you fill out immigration forms accurately by pre-populating fields from your profile and flagging common mistakes before submission.",
    highlights: [
      "Smart field population",
      "Error prevention",
      "Multi-form support",
      "Save & resume later",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 dot-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-6">
            <Zap className="h-4 w-4 text-primary" />
            Powered by AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI Tools for Your{" "}
            <span className="gradient-text-teal">Immigration Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From eligibility assessment to document preparation, our AI-powered
            tools guide you through every step of the immigration process.
          </p>
        </div>
      </section>

      {/* Features Detail */}
      <section className="relative pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    {feature.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="lg:w-[280px] shrink-0">
                  <div className="glass-strong rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Key Capabilities
                    </h4>
                    <ul className="space-y-2.5">
                      {feature.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text-teal">Get Started</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Try all features free for 14 days. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-teal"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
