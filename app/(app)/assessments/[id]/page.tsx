import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata = { title: "Assessment Results" };

export default async function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: assessment } = await supabase
    .from("imm_assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!assessment) notFound();

  const result = assessment.result_data as {
    recommended_programs?: Array<{
      program_name: string;
      program_code: string;
      country: string;
      score: number;
      reasoning: string;
      requirements_met: string[];
      requirements_unmet: string[];
      next_steps: string[];
    }>;
    summary?: string;
    alternative_countries?: Array<{ country: string; reason: string }>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/assessments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Assessments
      </Link>

      <div>
        <h1 className="text-2xl font-bold capitalize">{assessment.assessment_type.replace(/_/g, " ")} Results</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date(assessment.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
        </p>
      </div>

      {/* Overall score */}
      {assessment.overall_score != null && (
        <div className="glass rounded-xl p-6 flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={assessment.overall_score >= 70 ? "#4ade80" : assessment.overall_score >= 40 ? "#fbbf24" : "#f87171"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * assessment.overall_score) / 100}
                className="score-ring"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {assessment.overall_score}%
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg">Overall Score</p>
            <p className="text-sm text-muted-foreground">
              {assessment.overall_score >= 70 ? "Strong eligibility" : assessment.overall_score >= 40 ? "Moderate eligibility" : "Limited eligibility"}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-3">Summary</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{result.summary}</p>
        </div>
      )}

      {/* Recommended programs */}
      {result.recommended_programs?.map((prog, i) => (
        <div key={i} className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{prog.program_name}</h3>
              <p className="text-sm text-muted-foreground">{prog.country} &middot; {prog.program_code}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              prog.score >= 70 ? "bg-green-400/15 text-green-400" : prog.score >= 40 ? "bg-amber-400/15 text-amber-400" : "bg-red-400/15 text-red-400"
            }`}>
              {prog.score}%
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{prog.reasoning}</p>

          {prog.requirements_met?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-400 mb-1.5">Requirements Met</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {prog.requirements_met.map((r, j) => <li key={j} className="flex gap-2"><span className="text-green-400">+</span> {r}</li>)}
              </ul>
            </div>
          )}

          {prog.requirements_unmet?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-400 mb-1.5">Requirements to Address</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {prog.requirements_unmet.map((r, j) => <li key={j} className="flex gap-2"><span className="text-amber-400">-</span> {r}</li>)}
              </ul>
            </div>
          )}

          {prog.next_steps?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-primary mb-1.5">Next Steps</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                {prog.next_steps.map((s, j) => <li key={j}>{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      ))}

      {/* Alternative countries */}
      {result.alternative_countries && result.alternative_countries.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-3">Alternative Countries to Consider</h2>
          <div className="space-y-3">
            {result.alternative_countries.map((alt, i) => (
              <div key={i} className="flex gap-3">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{alt.country}</p>
                  <p className="text-xs text-muted-foreground">{alt.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center italic">
        This assessment is for informational purposes only and does not constitute legal advice.
        Please consult with a qualified immigration attorney for specific guidance.
      </p>
    </div>
  );
}
