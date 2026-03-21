import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { ChatInterface } from "./chat-interface";

export const metadata = { title: "AI Chat" };

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: conversations } = await supabase
    .from("imm_ai_conversations")
    .select("id, title, context_type, updated_at")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar - conversation list */}
      <div className="hidden md:flex w-72 flex-col glass rounded-xl">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations?.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </Link>
          ))}
          {!conversations?.length && (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              No conversations yet. Start chatting below.
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col glass rounded-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="font-semibold">AI Immigration Assistant</h1>
            <p className="text-xs text-muted-foreground">Ask anything about immigration</p>
          </div>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}
