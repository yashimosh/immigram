import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { Document } from "@/lib/types";
import {
  FileText,
  Calendar,
  HardDrive,
  Tag,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("imm_documents").select("file_name").eq("id", id).single();
  return { title: data?.file_name ?? "Document Detail" };
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("imm_documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!data) notFound();

  const doc = data as Document;
  const analysis = doc.ai_analysis;

  function getCategoryLabel(value: string) {
    return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{doc.file_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getCategoryLabel(doc.category)}
          </p>
        </div>
        {!analysis && (
          <Link
            href={`/api/ai/document-analyze?document_id=${doc.id}`}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" /> Analyze
          </Link>
        )}
      </div>

      {/* File info */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">File Information</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium">{getCategoryLabel(doc.category)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-medium">{(doc.file_size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
              <p className="font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Compliance</p>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
          </div>
        </div>
        {doc.expiry_date && (
          <div className="mt-4 pt-4 border-t border-border text-sm">
            <span className="text-muted-foreground">Expires:</span>{" "}
            <span className="font-medium">
              {new Date(doc.expiry_date).toLocaleDateString()}
            </span>
          </div>
        )}
        {doc.case_id && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href={`/cases/${doc.case_id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View linked case <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {analysis ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" /> AI Analysis
          </h2>

          {/* Summary */}
          <div className="glass rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>

          {/* Completeness score */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Completeness Score</h3>
              <span
                className={`text-lg font-bold ${
                  analysis.completeness_score >= 80
                    ? "text-green-400"
                    : analysis.completeness_score >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {analysis.completeness_score}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10">
              <div
                className={`h-2 rounded-full transition-all ${
                  analysis.completeness_score >= 80
                    ? "bg-green-400"
                    : analysis.completeness_score >= 50
                      ? "bg-amber-400"
                      : "bg-red-400"
                }`}
                style={{ width: `${analysis.completeness_score}%` }}
              />
            </div>
          </div>

          {/* Extracted fields */}
          {Object.keys(analysis.extracted_fields).length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" /> Extracted Fields
              </h3>
              <div className="space-y-2">
                {Object.entries(analysis.extracted_fields).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-border text-sm"
                  >
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Issues Found
              </h3>
              <ul className="space-y-2">
                {analysis.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" /> Suggestions
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="font-semibold mb-1">No analysis yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Run AI analysis to check document completeness and extract key information.
          </p>
          <Link
            href={`/api/ai/document-analyze?document_id=${doc.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" /> Analyze Document
          </Link>
        </div>
      )}
    </div>
  );
}
