import Link from "next/link";
import {
  ClipboardCheck,
  FileSearch,
  MessageSquare,
  Briefcase,
  Users,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "AI Eligibility Checker",
    description:
      "Answer a few questions and our AI instantly evaluates your eligibility across 50+ visa programs in 10+ countries.",
  },
  {
    icon: FileSearch,
    title: "Document Analyzer",
    description:
      "Upload your documents and let AI verify completeness, flag issues, and suggest improvements before submission.",
  },
  {
    icon: MessageSquare,
    title: "Smart Chatbot",
    description:
      "Get instant answers to your immigration questions from our AI assistant trained on the latest immigration policies.",
  },
  {
    icon: Briefcase,
    title: "Case Tracking",
    description:
      "Track your immigration case from start to finish with real-time status updates, deadlines, and next steps.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with others on the same journey. Share experiences, ask questions, and support each other.",
  },
  {
    icon: UserCheck,
    title: "Consultant Network",
    description:
      "Book sessions with verified immigration consultants and lawyers when you need professional guidance.",
  },
];

const COUNTRIES = [
  { name: "United States", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "France", flag: "🇫🇷" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "UAE", flag: "🇦🇪" },
  { name: "New Zealand", flag: "🇳🇿" },
];

const STEPS = [
  {
    number: "01",
    title: "Sign Up",
    description:
      "Create your free account in seconds. No credit card required to get started.",
  },
  {
    number: "02",
    title: "Assess",
    description:
      "Tell us about your background and goals. Our AI evaluates your eligibility across visa programs.",
  },
  {
    number: "03",
    title: "Navigate",
    description:
      "Get a personalized roadmap with step-by-step guidance, document checklists, and timeline estimates.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[90vh] flex items-center dot-pattern overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Immigration Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Navigate Your{" "}
              <span className="gradient-text-teal">Immigration Journey</span>{" "}
              with AI
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered eligibility assessment, document analysis, and
              personalized guidance across 10+ countries. Start your immigration
              journey with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-teal flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg glass font-semibold text-foreground hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Check Eligibility
                <ClipboardCheck className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                10+ countries supported
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text-teal">Immigrate Smarter</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful AI tools designed to simplify every step of the
              immigration process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group glass rounded-xl p-6 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Countries Section ── */}
      <section className="relative py-24 sm:py-32 dot-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-4">
              <Globe className="h-4 w-4 text-primary" />
              Global Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Supported <span className="gradient-text-teal">Countries</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get eligibility assessments and guidance for immigration programs
              across these countries and more.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COUNTRIES.map((country) => (
              <div
                key={country.name}
                className="glass rounded-xl p-4 text-center hover:bg-white/[0.06] transition-all duration-300"
              >
                <span className="text-3xl mb-2 block">{country.flag}</span>
                <span className="text-sm font-medium text-foreground">
                  {country.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text-teal">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to get started on your immigration journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="glass rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold gradient-text-teal">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start Your{" "}
            <span className="gradient-text-teal">Immigration Journey</span>{" "}
            Today
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Join thousands of people who are using AI to navigate the
            immigration process faster and more confidently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-teal flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg glass font-semibold text-foreground hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
