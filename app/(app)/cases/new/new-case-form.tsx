"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_COUNTRIES, VISA_TYPES } from "@/lib/constants";
import { Loader2, Briefcase } from "lucide-react";

export function NewCaseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    origin_country: "",
    target_country: "",
    visa_type: "",
    target_date: "",
    notes: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error: insertError } = await supabase
        .from("imm_cases")
        .insert({
          user_id: user.id,
          title: form.title,
          origin_country: form.origin_country,
          target_country: form.target_country,
          visa_type: form.visa_type,
          target_date: form.target_date || null,
          notes: form.notes || null,
          status: "draft",
          priority: "medium",
          metadata: {},
          ai_risk_factors: [],
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(`/cases/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Case Title
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g., UK Skilled Worker Visa Application"
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Origin Country */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Origin Country
        </label>
        <select
          required
          value={form.origin_country}
          onChange={(e) => update("origin_country", e.target.value)}
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select origin country</option>
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Target Country */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Target Country
        </label>
        <select
          required
          value={form.target_country}
          onChange={(e) => update("target_country", e.target.value)}
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select target country</option>
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Visa Type */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Visa Type
        </label>
        <select
          required
          value={form.visa_type}
          onChange={(e) => update("visa_type", e.target.value)}
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select visa type</option>
          {VISA_TYPES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Date */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Target Date (optional)
        </label>
        <input
          type="date"
          value={form.target_date}
          onChange={(e) => update("target_date", e.target.value)}
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Notes (optional)
        </label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Any additional details about your case..."
          className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Briefcase className="h-4 w-4" /> Create Case
            </>
          )}
        </button>
      </div>
    </form>
  );
}
