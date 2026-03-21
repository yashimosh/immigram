"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  CloudUpload,
} from "lucide-react";

export default function DocumentUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case_id");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !category) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { data: doc, error: insertError } = await supabase
        .from("imm_documents")
        .insert({
          user_id: user.id,
          case_id: caseId || null,
          file_name: file.name,
          file_type: file.type || `application/${fileExt}`,
          file_size: file.size,
          storage_path: filePath,
          category,
          compliance_status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Optionally trigger AI analysis
      try {
        await fetch("/api/ai/document-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document_id: doc.id }),
        });
      } catch {
        // Non-critical: analysis can be triggered later
      }

      router.push(`/documents/${doc.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground mt-1">
          Upload your immigration documents for AI-powered analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : file
                ? "border-green-400/50 bg-green-400/5"
                : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <CloudUpload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG, DOC, DOCX, TXT
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Document Category
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select category</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Linked case */}
        {caseId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-lg px-4 py-2.5 border border-primary/20">
            <FileText className="h-4 w-4 text-primary" />
            This document will be linked to case <span className="font-mono text-xs">{caseId.slice(0, 8)}...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !file || !category}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
