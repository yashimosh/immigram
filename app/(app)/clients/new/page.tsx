"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationality: "",
    notes: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      setError("First and last name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: dbError } = await supabase
      .from("imm_clients")
      .insert({
        agency_user_id: user!.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        nationality: form.nationality || null,
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (dbError) {
      setError("Failed to create client. Please try again.");
      setLoading(false);
      return;
    }
    router.push(`/clients/${data.id}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add Client</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name *</label>
              <input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="Jane"
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name *</label>
              <input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Smith"
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+44 7000 000000"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nationality</label>
            <input
              value={form.nationality}
              onChange={(e) => update("nationality", e.target.value)}
              placeholder="e.g. Iranian, Iraqi, Syrian"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any notes about this client..."
              rows={3}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? "Saving..." : "Add Client"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
