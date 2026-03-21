import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import {
  UserCheck,
  Star,
  Globe,
  DollarSign,
  ArrowRight,
  Briefcase,
} from "lucide-react";

export const metadata = { title: "Consultants" };

export default async function ConsultantsPage() {
  const supabase = await createClient();

  const { data: consultants } = await supabase
    .from("imm_profiles")
    .select("*")
    .eq("is_verified_consultant", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Immigration Consultants</h1>
        <p className="text-muted-foreground mt-1">
          Connect with verified immigration professionals
        </p>
      </div>

      {!consultants?.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <UserCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No consultants available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(consultants as Profile[]).map((c) => (
            <Link
              key={c.id}
              href={`/consultants/${c.id}`}
              className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {c.avatar_url ? (
                    <img
                      src={c.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <UserCheck className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">
                    {c.first_name} {c.last_name}
                  </h3>
                  {c.consultancy_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      {c.consultancy_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {c.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.specializations.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-primary font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {c.specializations.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-muted-foreground">
                      +{c.specializations.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {c.consultation_languages?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {c.consultation_languages.join(", ")}
                    </span>
                  </div>
                )}

                {c.hourly_rate_usd != null && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                    <span>${c.hourly_rate_usd}/hr</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View Profile <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
