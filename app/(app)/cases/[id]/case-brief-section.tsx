"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Sparkles, Copy, Download, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";

type BriefType = "standard" | "legal" | "summary";

interface CaseBrief {
  id: string;
  brief_type: BriefType;
  content: string;
  created_at: string;
  metadata?: { documents_count?: number; milestones_count?: number };
}

const BRIEF_TYPES: { value: BriefType; label: string; description: string }[] = [
  { value: "standard", label: "Standard", description: "Full case overview for general use" },
  { value: "legal", label: "Legal", description: "Attorney-ready brief with legal analysis" },
  { value: "summary", label: "Summary", description: "1-page executive summary" },
];

export function CaseBriefSection({ caseId, initialBriefs }: { caseId: string; initialBriefs: CaseBrief[] }) {
  const [briefs, setBriefs] = useState<CaseBrief[]>(initialBriefs);
  const [selectedType, setSelectedType] = useState<BriefType>("standard");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(initialBriefs[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/case-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, brief_type: selectedType }),
      });
      if (!res.ok) throw new Error("Failed to generate brief");
      const data = await res.json();
      const newBrief: CaseBrief = {
        id: data.id,
        brief_type: data.brief_type,
        content: data.brief,
        created_at: new Date().toISOString(),
      };
      setBriefs((prev) => [newBrief, ...prev]);
      setExpandedId(newBrief.id);
    } catch {
      setError("Failed to generate brief. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyBrief(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadBrief(brief: CaseBrief) {
    const blob = new Blob([brief.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-brief-${brief.brief_type}-${new Date(brief.created_at).toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Case Briefs
        </h2>
      </div>

      {/* Generator */}
      <div className="glass rounded-xl p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a professional case brief — useful for attorneys, legal consultants, or your own records.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {BRIEF_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                selectedType === t.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-white/[0.04]"
              }`}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate Brief"}
        </button>
      </div>

      {/* Existing briefs */}
      {briefs.length > 0 && (
        <div className="space-y-3">
          {briefs.map((brief) => {
            const isExpanded = expandedId === brief.id;
            return (
              <div key={brief.id} className="glass rounded-xl overflow-hidden">
                {/* Brief header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : brief.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium capitalize">{brief.brief_type} Brief</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(brief.created_at).toLocaleDateString(undefined, {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyBrief(brief.content); }}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadBrief(brief); }}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      .md
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Brief content */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="prose prose-sm prose-invert max-w-none
                      [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-foreground
                      [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-foreground
                      [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-foreground
                      [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:mb-2
                      [&_ul]:text-sm [&_ul]:text-muted-foreground [&_ul]:space-y-1 [&_ul]:mb-2
                      [&_li]:text-sm [&_li]:text-muted-foreground
                      [&_strong]:text-foreground [&_strong]:font-medium
                      [&_hr]:border-border [&_hr]:my-4">
                      <ReactMarkdown>{brief.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {briefs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No briefs generated yet. Click &ldquo;Generate Brief&rdquo; above to create one.
        </p>
      )}
    </div>
  );
}
