import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { Document } from "@/lib/types";
import { FileText, Upload, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from("imm_documents")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const docs = (documents ?? []) as Document[];

  // Group by category
  const grouped = DOCUMENT_CATEGORIES.reduce(
    (acc, cat) => {
      const items = docs.filter((d) => d.category === cat.value);
      if (items.length > 0) {
        acc.push({ ...cat, items });
      }
      return acc;
    },
    [] as { value: string; label: string; items: Document[] }[],
  );

  function getCategoryLabel(value: string) {
    return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <p className="text-muted-foreground mt-1">
            Store and manage your immigration documents
          </p>
        </div>
        <Link
          href="/documents/upload"
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Upload className="h-4 w-4" /> Upload
        </Link>
      </div>

      {/* Documents */}
      {docs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your immigration documents for AI-powered analysis.
          </p>
          <Link
            href="/documents/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Upload className="h-4 w-4" /> Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.value}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h2>
                <span className="text-xs text-muted-foreground">({group.items.length})</span>
              </div>
              <div className="space-y-2">
                {group.items.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          {doc.file_size > 0 && (
                            <> &middot; {(doc.file_size / 1024).toFixed(0)} KB</>
                          )}
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
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
