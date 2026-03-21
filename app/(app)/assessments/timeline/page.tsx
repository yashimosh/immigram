"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Case, TimelineResult } from "@/lib/types";
import {
  Clock,
  Loader2,
  ArrowLeft,
  CalendarDays,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function TimelinePage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TimelineResult | null>(null);

  useEffect(() => {
    async function loadCases() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("imm_cases")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      setCases(data ?? []);
      setLoading(false);
    }
    loadCases();
  }, []);

  async function handleRun() {
    if (!selectedCase) {
      setError("Please select a case.");
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: selectedCase }),
      });

      if (!res.ok) throw new Error("Timeline generation failed");

      const data = await res.json();

      if (data.id) {
        router.push(`/assessments/${data.id}`);
      } else if (data.result) {
        setResult(data.result as TimelineResult);
      }
    } catch {
      setError("Failed to generate timeline. Please try again.");
    }
    setRunning(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/assessments"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assessments
        </Link>
        <h1 className="text-2xl font-bold">Timeline Generator</h1>
        <p className="text-muted-foreground mt-1">
          Get a personalized immigration timeline with key milestones
        </p>
      </div>

      {/* Case selection */}
      <div className="glass rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">Select a Case</h2>

        {cases.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No cases found. Create a case first.
            </p>
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create a Case
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c.id)}
                  className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                    selectedCase === c.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-input text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs mt-0.5">
                    {c.target_country} &middot; {c.visa_type} &middot;{" "}
                    {c.status.replace(/_/g, " ")}
                  </p>
                </button>
              ))}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={handleRun}
                disabled={running || !selectedCase}
                className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" /> Generate Timeline
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Timeline result */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Timeline Summary</h2>
              <span className="text-sm text-primary font-medium">
                ~{result.total_estimated_days} days total
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>

          {/* Milestones */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-6">Milestones</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {result.milestones.map((m, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-[30px] h-[30px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0 z-10">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{m.title}</h3>
                        <span className="text-[11px] text-muted-foreground">
                          {m.duration_days} days
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.description}
                      </p>
                      <p className="text-[10px] text-primary mt-1">
                        Est. {new Date(m.estimated_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
