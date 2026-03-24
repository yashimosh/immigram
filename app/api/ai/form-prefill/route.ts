import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCompletion, MODEL_FAST } from "@/lib/ai/client";

const FORM_PREFILL_PROMPT = `You are an immigration form pre-fill assistant. Given document text (passport, ID, certificate, employment letter, etc.), extract structured data that can be used to auto-fill immigration forms.

Return a JSON object with these fields (include only fields you can confidently extract):
{
  "personal": {
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "date_of_birth": "",
    "place_of_birth": "",
    "nationality": "",
    "gender": "",
    "marital_status": "",
    "passport_number": "",
    "passport_expiry": "",
    "passport_issue_date": "",
    "national_id": ""
  },
  "contact": {
    "address": "",
    "city": "",
    "state_province": "",
    "postal_code": "",
    "country": "",
    "phone": "",
    "email": ""
  },
  "education": {
    "degree": "",
    "field_of_study": "",
    "institution": "",
    "graduation_date": "",
    "gpa": ""
  },
  "employment": {
    "employer": "",
    "job_title": "",
    "start_date": "",
    "end_date": "",
    "salary": "",
    "duties": ""
  },
  "document_type": "",
  "document_number": "",
  "issue_date": "",
  "expiry_date": "",
  "issuing_authority": "",
  "confidence_notes": []
}

Only include fields with actual data. Add notes to confidence_notes for any fields where extraction is uncertain. Respond with ONLY valid JSON.`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { document_id, document_ids } = body;

  const ids = document_ids || (document_id ? [document_id] : []);
  if (ids.length === 0) {
    return NextResponse.json({ error: "document_id or document_ids required" }, { status: 400 });
  }

  const allFields: Record<string, unknown> = {};
  const allNotes: string[] = [];

  for (const docId of ids) {
    const { data: doc } = await supabase
      .from("imm_documents")
      .select("*")
      .eq("id", docId)
      .eq("user_id", user.id)
      .single();

    if (!doc) continue;

    let text = doc.extracted_text;
    if (!text) {
      const { data: fileData } = await supabase.storage
        .from("documents")
        .download(doc.storage_path);
      if (!fileData) continue;
      text = await fileData.text();
      await supabase.from("imm_documents").update({ extracted_text: text }).eq("id", docId);
    }

    try {
      const result = await getCompletion({
        systemPrompt: FORM_PREFILL_PROMPT,
        userMessage: `Document category: ${doc.category}\nFile name: ${doc.file_name}\n\nDocument content:\n${text.slice(0, 8000)}`,
        maxTokens: 2048,
        temperature: 0.1,
      });

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Merge fields (later documents override earlier ones)
        for (const [section, fields] of Object.entries(parsed)) {
          if (section === "confidence_notes" && Array.isArray(fields)) {
            allNotes.push(...fields.map((n: string) => `[${doc.category}] ${n}`));
          } else if (typeof fields === "object" && fields !== null) {
            allFields[section] = { ...(allFields[section] as Record<string, unknown> || {}), ...fields as Record<string, unknown> };
          } else if (typeof fields === "string" && fields) {
            allFields[section] = fields;
          }
        }
      }
    } catch (e) {
      allNotes.push(`Failed to extract from ${doc.file_name}: ${e}`);
    }
  }

  return NextResponse.json({
    extracted_fields: allFields,
    confidence_notes: allNotes,
    documents_processed: ids.length,
  });
}
