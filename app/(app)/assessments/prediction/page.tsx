"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Case, PredictionResult } from "@/lib/types";
import {
  TrendingUp,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function PredictionPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

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
      const res = await fetch("/api/ai/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: selectedCase }),
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();

      if (data.id) {
        router.push(`/assessments/${data.id}`);
      } else if (data.result) {
        setResult(data.result as PredictionResult);
      }
    } catch {
      setError("Failed to run prediction. Please try again.");
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
        <h1 className="text-2xl font-bold">Outcome Predictor</h1>
        <p className="text-muted-foreground mt-1">
          AI predicts the approval likelihood for your case
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" /> Run Prediction
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="glass rounded-xl p-6 text-center">
            <h2 className="text-sm text-muted-foreground mb-2">
              Approval Probability
            </h2>
            <p
              className={`text-5xl font-bold ${
                result.approval_probability >= 70
                  ? "text-green-400"
                  : result.approval_probability >= 40
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {result.approval_probability}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Confidence: {result.confidence}%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Positive factors */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Positive Factors
              </h3>
              <ul className="space-y-2">
                {result.positive_factors.map((f, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk factors */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Risk Factors
              </h3>
              <ul className="space-y-2">
                {result.risk_factors.map((f, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-primary">
                <Lightbulb className="h-4 w-4" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
