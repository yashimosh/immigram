import { createClient } from "@/lib/supabase/server";
import { CASE_STATUSES, SUPPORTED_COUNTRIES, VISA_TYPES } from "@/lib/constants";
import type { Case, CaseMilestone, Document } from "@/lib/types";
import {
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Clock,
  TrendingUp,
  Upload,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseBriefSection } from "./case-brief-section";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("imm_cases").select("title").eq("id", id).single();
  return { title: data?.title ?? "Case Detail" };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [caseRes, milestonesRes, documentsRes, briefsRes] = await Promise.all([
    supabase.from("imm_cases").select("*").eq("id", id).eq("user_id", user!.id).single(),
    supabase
      .from("imm_case_milestones")
      .select("*")
      .eq("case_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("imm_documents")
      .select("*")
      .eq("case_id", id)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("imm_case_briefs")
      .select("id, brief_type, content, created_at, metadata")
      .eq("case_id", id)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!caseRes.data) notFound();

  const caseData = caseRes.data as Case;
  const milestones = (milestonesRes.data ?? []) as CaseMilestone[];
  const documents = (documentsRes.data ?? []) as Document[];
  const briefs = briefsRes.data ?? [];

  function getCountryName(code: string) {
    return SUPPORTED_COUNTRIES.find((c) => c.code === code)?.name ?? code;
  }

  function getVisaLabel(value: string) {
    return VISA_TYPES.find((v) => v.value === value)?.label ?? value;
  }

  function getStatusLabel(value: string) {
    return CASE_STATUSES.find((s) => s.value === value)?.label ?? value.replace(/_/g, " ");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{caseData.title}</h1>
            <span className={`status-${caseData.status} px-2.5 py-1 rounded-full text-xs font-medium`}>
              {getStatusLabel(caseData.status)}
            </span>
          </div>
          {caseData.case_number && (
            <p className="text-sm text-muted-foreground">Case #{caseData.case_number}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/documents/upload?case_id=${caseData.id}`}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-white/[0.06] transition-colors"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium">Route</span>
          </div>
          <p className="text-sm font-medium">
            {getCountryName(caseData.origin_country)} &rarr; {getCountryName(caseData.target_country)}
          </p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs font-medium">Visa Type</span>
          </div>
          <p className="text-sm font-medium">{getVisaLabel(caseData.visa_type)}</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Target Date</span>
          </div>
          <p className="text-sm font-medium">
            {caseData.target_date
              ? new Date(caseData.target_date).toLocaleDateString()
              : "Not set"}
          </p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">AI Approval Score</span>
          </div>
          {caseData.ai_approval_score != null ? (
            <p
              className={`text-sm font-bold ${
                caseData.ai_approval_score >= 70
                  ? "text-green-400"
                  : caseData.ai_approval_score >= 40
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {caseData.ai_approval_score}%
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Not assessed</p>
          )}
        </div>
      </div>

      {/* Dates row */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Key Dates
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Created</p>
            <p className="font-medium">{new Date(caseData.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Last Updated</p>
            <p className="font-medium">{new Date(caseData.updated_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Submitted</p>
            <p className="font-medium">
              {caseData.submitted_date
                ? new Date(caseData.submitted_date).toLocaleDateString()
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Decision</p>
            <p className="font-medium">
              {caseData.decision_date
                ? new Date(caseData.decision_date).toLocaleDateString()
                : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {caseData.notes && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.notes}</p>
        </div>
      )}

      {/* AI Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/assessments/timeline?case_id=${caseData.id}`}
          className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium">Generate Timeline</h3>
              <p className="text-xs text-muted-foreground">
                AI-generated milestones for your case
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          href={`/assessments/prediction?case_id=${caseData.id}`}
          className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium">Predict Outcome</h3>
              <p className="text-xs text-muted-foreground">
                AI predicts approval likelihood
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

      {/* Case Briefs */}
      <CaseBriefSection caseId={caseData.id} initialBriefs={briefs} />

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Milestones</h2>
        {milestones.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No milestones yet. Use &ldquo;Generate Timeline&rdquo; to create AI-powered milestones.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="glass rounded-xl px-5 py-4 flex items-start gap-3"
              >
                {m.is_completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium text-sm ${m.is_completed ? "line-through text-muted-foreground" : ""}`}>
                      {m.title}
                    </p>
                    {m.ai_generated && (
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0">
                        AI
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {m.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {m.completed_at && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed {new Date(m.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <Link
            href={`/documents/upload?case_id=${caseData.id}`}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Upload <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {documents.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No documents linked to this case yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {doc.category.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      doc.compliance_status === "compliant"
                        ? "bg-green-400/10 text-green-400"
                        : doc.compliance_status === "non_compliant"
                          ? "bg-red-400/10 text-red-400"
                          : "bg-amber-400/10 text-amber-400"
                    }`}
                  >
                    {doc.compliance_status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
