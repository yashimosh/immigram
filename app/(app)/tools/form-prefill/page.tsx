import { createClient } from "@/lib/supabase/server";
import { PrefillTool } from "./prefill-tool";
import { Wand2 } from "lucide-react";

export const metadata = { title: "Form Prefill — Immigram" };

export default async function FormPrefillPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from("imm_documents")
    .select("id, file_name, category")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Document Prefill</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1 ml-12">
          Upload your passport, employment letter, or any ID — AI extracts all form fields automatically so you never retype the same information twice.
        </p>
      </div>

      <PrefillTool documents={documents ?? []} />
    </div>
  );
}
