import { createClient } from "@/lib/supabase/server";
import { CASE_STATUSES, VISA_TYPES } from "@/lib/constants";
import { ArrowLeft, Briefcase, Mail, Phone, Globe, Plus, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("imm_clients").select("first_name, last_name").eq("id", id).single();
  return { title: data ? `${data.first_name} ${data.last_name} — Immigram` : "Client" };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [clientRes, casesRes] = await Promise.all([
    supabase.from("imm_clients").select("*").eq("id", id).eq("agency_user_id", user!.id).single(),
    supabase.from("imm_cases").select("*").eq("client_id", id).order("updated_at", { ascending: false }),
  ]);

  if (!clientRes.data) notFound();

  const client = clientRes.data;
  const cases = casesRes.data ?? [];
  const activeCases = cases.filter((c) => !["approved", "denied", "closed"].includes(c.status));

  function getStatusLabel(value: string) {
    return CASE_STATUSES.find((s) => s.value === value)?.label ?? value.replace(/_/g, " ");
  }

  function getVisaLabel(value: string) {
    return VISA_TYPES.find((v) => v.value === value)?.label ?? value;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary">
            {client.first_name[0]}{client.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.first_name} {client.last_name}</h1>
            {client.nationality && <p className="text-sm text-muted-foreground">{client.nationality}</p>}
          </div>
        </div>
      </div>

      {/* Stats + contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Cases</p>
          <p className="text-2xl font-bold">{cases.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Cases</p>
          <p className="text-2xl font-bold text-blue-400">{activeCases.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Since</p>
          <p className="text-sm font-medium mt-1">{new Date(client.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
        </div>
      </div>

      {/* Contact info */}
      {(client.email || client.phone) && (
        <div className="glass rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">Contact</h2>
          {client.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.nationality && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{client.nationality}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      {/* Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cases</h2>
          <Link
            href={`/cases/new?client_id=${client.id}`}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> New Case
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No cases for this client yet.</p>
            <Link
              href={`/cases/new?client_id=${client.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Create Case
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{getVisaLabel(c.visa_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`status-${c.status} px-2.5 py-1 rounded-full text-xs font-medium`}>
                    {getStatusLabel(c.status)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
