import { createClient } from "@/lib/supabase/server";
import { Users, Plus, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Clients — Immigram" };

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: clients } = await supabase
    .from("imm_clients")
    .select("*, imm_cases(id, status, title, visa_type)")
    .eq("agency_user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their cases.</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Client
        </Link>
      </div>

      {!clients?.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No clients yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first client to manage their immigration cases.
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add First Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => {
            const cases = (client.imm_cases as { id: string; status: string; title: string; visa_type: string }[]) ?? [];
            const activeCases = cases.filter((c) => !["approved", "denied", "closed"].includes(c.status));
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.first_name} {client.last_name}</h3>
                      {client.email && (
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {cases.length} case{cases.length !== 1 ? "s" : ""}
                  </span>
                  {activeCases.length > 0 && (
                    <span className="bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">
                      {activeCases.length} active
                    </span>
                  )}
                  {client.nationality && (
                    <span>{client.nationality}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
