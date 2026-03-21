"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COMMUNITY_CATEGORIES, SUPPORTED_COUNTRIES, VISA_TYPES } from "@/lib/constants";
import { ArrowLeft, Loader2, Send, X } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: "question",
    title: "",
    content: "",
    country_tags: [] as string[],
    visa_tags: [] as string[],
  });

  function toggleTag(
    field: "country_tags" | "visa_tags",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error: insertErr } = await supabase
        .from("imm_community_posts")
        .insert({
          user_id: user.id,
          category: form.category,
          title: form.title.trim(),
          content: form.content.trim(),
          country_tags: form.country_tags,
          visa_tags: form.visa_tags,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      router.push(`/community/${data.id}`);
    } catch {
      setError("Failed to create post. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/community"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Community
        </Link>
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground mt-1">
          Share your question, tip, or experience with the community
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass rounded-xl p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COMMUNITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="What is your post about?"
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your post here..."
              rows={8}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Country tags */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Country Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleTag("country_tags", c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.country_tags.includes(c.code)
                      ? "bg-primary/10 text-primary border border-primary"
                      : "bg-input border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c.flag} {c.name}
                  {form.country_tags.includes(c.code) && (
                    <X className="h-3 w-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visa tags */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Visa Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {VISA_TYPES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => toggleTag("visa_tags", v.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.visa_tags.includes(v.value)
                      ? "bg-primary/10 text-primary border border-primary"
                      : "bg-input border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {v.label}
                  {form.visa_tags.includes(v.value) && (
                    <X className="h-3 w-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Publish Post
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
