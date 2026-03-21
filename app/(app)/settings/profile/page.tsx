"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import {
  ArrowLeft,
  Loader2,
  Save,
  UserCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    nationality: "",
    country_of_residence: "",
    occupation: "",
    bio: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("imm_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          date_of_birth: data.date_of_birth ?? "",
          nationality: data.nationality ?? "",
          country_of_residence: data.country_of_residence ?? "",
          occupation: data.occupation ?? "",
          bio: data.bio ?? "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: updateErr } = await supabase
        .from("imm_profiles")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          date_of_birth: form.date_of_birth || null,
          nationality: form.nationality || null,
          country_of_residence: form.country_of_residence || null,
          occupation: form.occupation || null,
          bio: form.bio || null,
        })
        .eq("user_id", user.id);

      if (updateErr) throw updateErr;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> Edit Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Update your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Nationality
              </label>
              <select
                value={form.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Country of Residence
              </label>
              <select
                value={form.country_of_residence}
                onChange={(e) =>
                  update("country_of_residence", e.target.value)
                }
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Occupation
            </label>
            <input
              type="text"
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              placeholder="e.g., Software Engineer"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-400 bg-green-400/10 rounded-lg px-4 py-2.5">
              Profile updated successfully!
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
