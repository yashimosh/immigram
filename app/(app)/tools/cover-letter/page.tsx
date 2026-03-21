"use client";

import { useState } from "react";
import { SUPPORTED_COUNTRIES, VISA_TYPES } from "@/lib/constants";
import {
  Wand2,
  Loader2,
  Copy,
  Check,
  FileText,
} from "lucide-react";

export default function CoverLetterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    visa_type: "work",
    target_country: "",
    purpose: "",
    background: "",
    achievements: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.target_country || !form.purpose) {
      setError("Please fill in country and purpose.");
      return;
    }

    setLoading(true);
    setError(null);
    setLetter(null);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              text += parsed.text;
              setLetter(text);
            } catch {
              // skip
            }
          }
        }
      }

      if (!text) {
        const json = await res.json().catch(() => null);
        if (json?.letter) setLetter(json.letter);
      }
    } catch {
      setError("Failed to generate cover letter. Please try again.");
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate a professional immigration cover letter tailored to your
          application
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass rounded-xl p-6 space-y-5">
          {/* Visa type */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Visa Type
            </label>
            <select
              value={form.visa_type}
              onChange={(e) => update("visa_type", e.target.value)}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {VISA_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target country */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Target Country
            </label>
            <select
              value={form.target_country}
              onChange={(e) => update("target_country", e.target.value)}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a country</option>
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Purpose of Application
            </label>
            <textarea
              value={form.purpose}
              onChange={(e) => update("purpose", e.target.value)}
              placeholder="Describe why you are applying for this visa..."
              rows={3}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Professional Background
            </label>
            <textarea
              value={form.background}
              onChange={(e) => update("background", e.target.value)}
              placeholder="Describe your education, work experience, and relevant qualifications..."
              rows={3}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Key Achievements
            </label>
            <textarea
              value={form.achievements}
              onChange={(e) => update("achievements", e.target.value)}
              placeholder="List key achievements, publications, awards, etc..."
              rows={3}
              className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Generate Letter
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generated letter */}
      {letter && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Generated Cover
              Letter
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {letter}
          </div>
        </div>
      )}
    </div>
  );
}
