import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, CreditCard, Check, Sparkles, Users } from "lucide-react";
import { CheckoutButton } from "./checkout-button";

export const metadata = { title: "Billing — Immigram" };

const PLANS = [
  {
    key: "free" as const,
    label: "Free",
    priceUsd: 0,
    icon: null,
    description: "Get started",
    features: [
      "1 active case",
      "5 AI chats/day",
      "Basic eligibility check",
      "Community access",
    ],
  },
  {
    key: "pro" as const,
    label: "Pro",
    priceUsd: 29,
    icon: Sparkles,
    description: "For self-filers",
    features: [
      "Unlimited cases",
      "All 13 AI features",
      "Document prefill",
      "Case briefs",
      "Translation (7 languages)",
      "Outcome predictions",
      "Priority AI (Claude Sonnet)",
    ],
    highlight: true,
  },
  {
    key: "agency" as const,
    label: "Agency",
    priceUsd: 99,
    icon: Users,
    description: "For lawyers & consultants",
    features: [
      "Everything in Pro",
      "Multi-client dashboard",
      "Bulk case briefs",
      "Client management",
      "Lawyer-ready exports",
      "Priority support",
    ],
  },
];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("imm_users")
    .select("subscription_tier, subscription_expires_at")
    .eq("id", user!.id)
    .single();

  const currentTier = userData?.subscription_tier ?? "free";
  const expiresAt = userData?.subscription_expires_at;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/settings"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-purple-400" /> Billing
        </h1>
        <p className="text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      {/* Status banners */}
      {status === "success" && (
        <div className="rounded-xl bg-green-400/10 border border-green-400/20 px-5 py-4 text-sm text-green-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Payment successful! Your plan has been upgraded.
        </div>
      )}
      {status === "failed" && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-5 py-4 text-sm text-destructive">
          Payment failed or was cancelled. Please try again.
        </div>
      )}

      {/* Current plan */}
      <div className="glass rounded-xl p-6">
        <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold capitalize">{currentTier}</p>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Active</span>
        </div>
        {expiresAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Renews on {new Date(expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isActive = currentTier === plan.key;
          const Icon = plan.icon;
          return (
            <div
              key={plan.key}
              className={`glass rounded-xl p-5 flex flex-col ${
                plan.highlight ? "border border-primary/40 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                <h3 className="font-semibold">{plan.label}</h3>
                {plan.highlight && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium ml-auto">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

              <p className="text-2xl font-bold mb-4">
                ${plan.priceUsd}
                {plan.priceUsd > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                )}
              </p>

              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="w-full rounded-lg px-4 py-2 text-sm font-medium text-center bg-white/5 text-muted-foreground">
                  Current Plan
                </div>
              ) : plan.key === "free" ? (
                <div className="w-full rounded-lg px-4 py-2 text-sm font-medium text-center bg-white/5 text-muted-foreground">
                  Downgrade
                </div>
              ) : (
                <CheckoutButton plan={plan.key} label={`Upgrade to ${plan.label}`} />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Payments processed securely by iyzico. Billed monthly.
      </p>
    </div>
  );
}
