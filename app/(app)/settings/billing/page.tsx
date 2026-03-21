import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";
import { ArrowLeft, CreditCard, Check, Sparkles } from "lucide-react";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("imm_users")
    .select("subscription_tier, subscription_expires_at")
    .eq("id", user!.id)
    .single();

  const currentTier = userData?.subscription_tier ?? "free";
  const expiresAt = userData?.subscription_expires_at;

  const tierFeatures: Record<string, string[]> = {
    free: [
      "1 active case",
      "5 AI chat messages/day",
      "Basic eligibility check",
      "Community access",
    ],
    starter: [
      "3 active cases",
      "50 AI chat messages/day",
      "All assessment tools",
      "Document analysis",
      "Cover letter generator",
    ],
    professional: [
      "10 active cases",
      "Unlimited AI chat",
      "Priority support",
      "Form filling assistant",
      "Outcome predictions",
      "Timeline generator",
    ],
    enterprise: [
      "Unlimited cases",
      "Unlimited AI chat",
      "Dedicated consultant",
      "Custom integrations",
      "Team management",
      "API access",
    ],
  };

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
        <p className="text-muted-foreground mt-1">
          Manage your subscription plan
        </p>
      </div>

      {/* Current plan */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Current Plan
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold capitalize">{currentTier}</p>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Active
          </span>
        </div>
        {expiresAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Renews on {new Date(expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isActive = currentTier === tier.value;
          return (
            <div
              key={tier.value}
              className={`glass rounded-xl p-5 ${
                isActive ? "border border-primary/30 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold">{tier.label}</h3>
                {isActive && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold mb-4">
                ${tier.priceUsd}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>

              <ul className="space-y-2 mb-5">
                {(tierFeatures[tier.value] ?? []).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isActive}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity ${
                  isActive
                    ? "bg-white/5 text-muted-foreground cursor-default"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {isActive ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Payment processing coming soon. Contact support for enterprise plans.
      </p>
    </div>
  );
}
