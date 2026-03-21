import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClipboardCheck, TrendingUp, Clock, ArrowRight } from "lucide-react";

export const metadata = { title: "Assessments" };

export default async function AssessmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: assessments } = await supabase
    .from("imm_assessments")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const tools = [
    {
      title: "Visa Eligibility Checker",
      description: "Find out which visas you qualify for across 10 countries",
      href: "/assessments/eligibility",
      icon: ClipboardCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Outcome Predictor",
      description: "AI predicts your case approval likelihood",
      href: "/assessments/prediction",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Timeline Generator",
      description: "Get a personalized immigration timeline",
      href: "/assessments/timeline",
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Assessments</h1>
        <p className="text-muted-foreground mt-1">AI-powered immigration analysis tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass rounded-xl p-6 hover:bg-white/[0.06] transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${tool.color}`} />
              </div>
              <h3 className="font-semibold mb-1">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Start <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Past assessments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Assessments</h2>
        {!assessments?.length ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No assessments yet. Try the eligibility checker above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assessments.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/${a.id}`}
                className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
              >
                <div>
                  <p className="font-medium capitalize">{a.assessment_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                {a.overall_score != null && (
                  <div className={`text-sm font-medium ${a.overall_score >= 70 ? "text-green-400" : a.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                    Score: {a.overall_score}%
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
