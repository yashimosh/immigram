import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Globe,
  Shield,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Immigram's mission is to make immigration accessible, transparent, and less stressful through AI-powered guidance.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Empathy First",
    description:
      "Immigration is deeply personal. We build with empathy, understanding the stress and uncertainty that comes with navigating a new country's systems.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description:
      "Immigration guidance shouldn't be a privilege. We're democratizing access to high-quality immigration information and tools for everyone.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "We're transparent about what our AI can and can't do. We always recommend consulting licensed professionals for legal decisions.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Innovation",
    description:
      "Immigration policies change constantly. We continuously update our AI models and knowledge base to provide the most current guidance.",
  },
];

const STATS = [
  { value: "10+", label: "Countries Supported" },
  { value: "50+", label: "Visa Programs" },
  { value: "24/7", label: "AI Availability" },
  { value: "100%", label: "Commitment to Accuracy" },
];

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 dot-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Making Immigration{" "}
            <span className="gradient-text-teal">Accessible</span> for Everyone
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe that navigating immigration should not require thousands
            of dollars in legal fees or months of confusion. Immigram combines
            the power of AI with deep immigration expertise to give everyone
            access to clear, personalized guidance.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-xl p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Every year, millions of people around the world seek to build
              better lives through immigration. Yet the process remains
              unnecessarily complex, opaque, and expensive. Critical information
              is scattered across government websites, legal jargon is
              impenetrable, and professional guidance is often out of reach.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Immigram exists to change this. We are building an AI-powered
              platform that makes immigration guidance accessible, transparent,
              and personalized. Whether you are a skilled professional looking
              for work abroad, a student seeking educational opportunities, or a
              family hoping to reunite, Immigram provides the tools and
              information you need to navigate your journey with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-3xl font-bold gradient-text-teal mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our <span className="gradient-text-teal">Values</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="glass rounded-xl p-6 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 dot-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join the <span className="gradient-text-teal">Community</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Start your immigration journey with AI-powered guidance. Free to get
            started, no credit card required.
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
