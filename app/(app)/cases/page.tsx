import { createClient } from "@/lib/supabase/server";
import { CASE_STATUSES, SUPPORTED_COUNTRIES, VISA_TYPES } from "@/lib/constants";
import { Briefcase, Plus, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Cases" };

export default async function CasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from("imm_cases")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cases</h1>
          <p className="text-muted-foreground mt-1">
            Manage your immigration applications
          </p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Case
        </Link>
      </div>

      {/* Cases list */}
      {!cases?.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No cases yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start your immigration journey by creating a new case.
          </p>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Create Your First Case
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getCountryName(c.origin_country)} &rarr; {getCountryName(c.target_country)}
                    </p>
                  </div>
                </div>
                <span className={`status-${c.status} px-2.5 py-1 rounded-full text-xs font-medium shrink-0`}>
                  {getStatusLabel(c.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{getVisaLabel(c.visa_type)}</span>
                {c.target_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.target_date).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(c.updated_at).toLocaleDateString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
