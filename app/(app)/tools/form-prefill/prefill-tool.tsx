"use client";

import { useState } from "react";
import { Wand2, Loader2, Copy, Check, FileText, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  category: string;
}

interface ExtractedFields {
  personal?: Record<string, string>;
  contact?: Record<string, string>;
  education?: Record<string, string>;
  employment?: Record<string, string>;
  document_type?: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
}

const SECTION_LABELS: Record<string, string> = {
  personal: "Personal Information",
  contact: "Contact & Address",
  education: "Education",
  employment: "Employment",
};

function FieldGroup({ title, fields }: { title: string; fields: Record<string, string> }) {
  const [open, setOpen] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const entries = Object.entries(fields).filter(([, v]) => v);
  if (entries.length === 0) return null;

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-sm font-semibold">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-5 py-3 group">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground capitalize mb-0.5">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
              <button
                onClick={() => copy(value, key)}
                className="ml-3 shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded border border-border hover:border-primary/50"
              >
                {copiedKey === key ? (
                  <><Check className="h-3 w-3 text-green-400" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PrefillTool({ documents }: { documents: Document[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ extracted_fields: ExtractedFields; confidence_notes: string[]; documents_processed: number } | null>(null);

  function toggleDoc(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function extract() {
    if (selectedIds.size === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/form-prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to extract fields. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const topLevelFields = result
    ? Object.entries(result.extracted_fields).filter(
        ([k]) => !["personal", "contact", "education", "employment"].includes(k) && result.extracted_fields[k as keyof ExtractedFields]
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Document selector */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-sm mb-1">Select Documents</h2>
          <p className="text-xs text-muted-foreground">
            Choose one or more documents. AI will extract form fields from all selected documents and merge the results.
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No documents uploaded yet.{" "}
            <a href="/documents/upload" className="text-primary hover:underline">Upload a document</a> to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const selected = selectedIds.has(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-white/[0.04]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selected ? "bg-primary/20" : "bg-white/[0.06]"
                  }`}>
                    <FileText className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.category.replace(/_/g, " ")}</p>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                    selected ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {selectedIds.size === 0 ? "No documents selected" : `${selectedIds.size} document${selectedIds.size > 1 ? "s" : ""} selected`}
          </p>
          <button
            onClick={extract}
            disabled={loading || selectedIds.size === 0}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Extracting..." : "Extract Fields"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Extracted Fields</h2>
            <span className="text-xs text-muted-foreground bg-white/[0.06] px-2.5 py-1 rounded-full">
              {result.documents_processed} doc{result.documents_processed > 1 ? "s" : ""} processed
            </span>
          </div>

          {/* Top-level fields (document_type, etc.) */}
          {topLevelFields.length > 0 && (
            <div className="glass rounded-xl overflow-hidden divide-y divide-border">
              {topLevelFields.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize mb-0.5">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm font-medium">{String(value)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section groups */}
          {(["personal", "contact", "education", "employment"] as const).map((section) => {
            const fields = result.extracted_fields[section];
            if (!fields || Object.keys(fields).length === 0) return null;
            return (
              <FieldGroup
                key={section}
                title={SECTION_LABELS[section]}
                fields={fields as Record<string, string>}
              />
            );
          })}

          {/* Confidence notes */}
          {result.confidence_notes.length > 0 && (
            <div className="glass rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Extraction Notes
              </p>
              {result.confidence_notes.map((note, i) => (
                <p key={i} className="text-xs text-muted-foreground">{note}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
