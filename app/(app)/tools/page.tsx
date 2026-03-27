import Link from "next/link";
import { Wand2, FileText, Languages, Search, ArrowRight } from "lucide-react";

export const metadata = { title: "Tools — Immigram" };

const TOOLS = [
  {
    href: "/tools/cover-letter",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Cover Letter Generator",
    description: "Generate a professional immigration cover letter tailored to your visa type and destination.",
  },
  {
    href: "/tools/form-prefill",
    icon: Wand2,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    title: "Document Prefill",
    description: "Upload passport, employment letter, or ID — AI extracts form fields automatically.",
  },
  {
    href: "/tools/translate",
    icon: Languages,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "Document Translation",
    description: "Translate documents between English, Persian, Kurdish, Arabic, and more.",
  },
  {
    href: "/tools/semantic-search",
    icon: Search,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    title: "Semantic Search",
    description: "Search across all your documents using natural language queries.",
  },
] as const;

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-muted-foreground mt-1">AI-powered utilities to speed up your immigration process.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass rounded-xl p-5 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${tool.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">{tool.title}</h2>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
