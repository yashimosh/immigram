import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for every stage of your immigration journey. Start for free.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started and explore your options.",
    features: [
      "Eligibility checker (1 assessment/month)",
      "AI chatbot (5 messages/day)",
      "Community access",
      "Basic country guides",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "For individuals actively preparing their application.",
    features: [
      "Unlimited eligibility assessments",
      "Unlimited AI chat messages",
      "Document analysis (10/month)",
      "1 active case tracking",
      "Priority community access",
      "Detailed visa roadmaps",
      "Email & chat support",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=starter",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For those who want full support through their journey.",
    features: [
      "Everything in Starter, plus:",
      "Unlimited document analysis",
      "Unlimited case tracking",
      "Priority AI responses",
      "Consultant booking (2 sessions/month)",
      "Cover letter generator",
      "Form auto-fill assistant",
      "Dedicated support agent",
      "Early access to new features",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=professional",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 dot-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            Simple Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Plans for Every{" "}
            <span className="gradient-text-teal">Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start free and upgrade as your immigration journey progresses. No
            hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl p-6 lg:p-8 flex flex-col ${
                  tier.highlighted
                    ? "glass-strong glow-teal ring-1 ring-primary/30 scale-[1.02]"
                    : "glass"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">
                      {tier.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`w-full py-3 rounded-lg font-semibold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-teal"
                      : "glass hover:bg-white/10 text-foreground"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ note */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground text-sm">
              All plans include a 14-day free trial. No credit card required to
              start.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
