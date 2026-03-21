import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import {
  ArrowLeft,
  UserCheck,
  Globe,
  DollarSign,
  Calendar,
  Briefcase,
  Shield,
  Mail,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("imm_profiles")
    .select("first_name, last_name")
    .eq("id", id)
    .single();
  return {
    title: data ? `${data.first_name} ${data.last_name}` : "Consultant",
  };
}

export default async function ConsultantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: consultant, error } = await supabase
    .from("imm_profiles")
    .select("*")
    .eq("id", id)
    .eq("is_verified_consultant", true)
    .single();

  if (error || !consultant) notFound();

  const c = consultant as Profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/consultants"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Consultants
      </Link>

      {/* Profile header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {c.avatar_url ? (
              <img
                src={c.avatar_url}
                alt=""
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <UserCheck className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {c.first_name} {c.last_name}
              </h1>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            {c.consultancy_name && (
              <p className="text-sm text-muted-foreground">
                {c.consultancy_name}
              </p>
            )}
            {c.license_number && (
              <p className="text-xs text-muted-foreground mt-0.5">
                License: {c.license_number}
              </p>
            )}
          </div>
        </div>

        {c.bio && (
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {c.bio}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specializations */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-primary" /> Specializations
          </h2>
          {c.specializations?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {c.specializations.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 text-xs text-primary font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not specified</p>
          )}
        </div>

        {/* Languages */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-primary" /> Languages
          </h2>
          {c.consultation_languages?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {c.consultation_languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-muted-foreground font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not specified</p>
          )}
        </div>

        {/* Rate */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" /> Hourly Rate
          </h2>
          {c.hourly_rate_usd != null ? (
            <p className="text-2xl font-bold text-primary">
              ${c.hourly_rate_usd}
              <span className="text-sm font-normal text-muted-foreground">
                /hr
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Contact for pricing</p>
          )}
        </div>

        {/* Country / Nationality */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" /> Location
          </h2>
          <p className="text-sm">
            {c.country_of_residence ?? "Not specified"}
          </p>
        </div>
      </div>

      {/* Book consultation */}
      <div className="glass rounded-xl p-6 text-center">
        <h2 className="font-semibold mb-2">Ready to get started?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Book a consultation with {c.first_name} to discuss your immigration
          case.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          disabled
        >
          <Calendar className="h-4 w-4" /> Book Consultation
        </button>
        <p className="text-[10px] text-muted-foreground mt-2">
          Booking functionality coming soon
        </p>
      </div>
    </div>
  );
}
