import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  FileText,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [casesRes, docsRes, assessmentsRes, notificationsRes] = await Promise.all([
    supabase.from("imm_cases").select("id, status, title, target_country, visa_type, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
    supabase.from("imm_documents").select("id").eq("user_id", user!.id),
    supabase.from("imm_assessments").select("id").eq("user_id", user!.id),
    supabase.from("imm_notifications").select("id").eq("user_id", user!.id).eq("is_read", false),
  ]);

  const cases = casesRes.data ?? [];
  const totalDocs = docsRes.data?.length ?? 0;
  const totalAssessments = assessmentsRes.data?.length ?? 0;
  const unreadNotifications = notificationsRes.data?.length ?? 0;

  const activeCases = cases.filter(
    (c) => !["approved", "denied", "closed"].includes(c.status),
  ).length;

  const stats = [
    {
      label: "Active Cases",
      value: activeCases,
      icon: Briefcase,
      href: "/cases",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Documents",
      value: totalDocs,
      icon: FileText,
      href: "/documents",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Assessments",
      value: totalAssessments,
      icon: ClipboardCheck,
      href: "/assessments",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Unread Alerts",
      value: unreadNotifications,
      icon: MessageSquare,
      href: "/settings/notifications",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your immigration journey at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/assessments/eligibility"
          className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Check Eligibility</h3>
              <p className="text-xs text-muted-foreground">AI-powered visa assessment</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Find out which visas you qualify for across 10 countries.
          </p>
        </Link>

        <Link
          href="/chat"
          className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask anything about immigration</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Get instant answers about visas, requirements, and processes.
          </p>
        </Link>

        <Link
          href="/documents/upload"
          className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium">Upload Document</h3>
              <p className="text-xs text-muted-foreground">AI analyzes your documents</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload documents for AI-powered completeness checking.
          </p>
        </Link>
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Cases</h2>
          <Link
            href="/cases"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">No cases yet</p>
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Case
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Briefcase className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.target_country} &middot; {c.visa_type}
                    </p>
                  </div>
                </div>
                <span className={`status-${c.status} px-2.5 py-1 rounded-full text-xs font-medium shrink-0`}>
                  {c.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
