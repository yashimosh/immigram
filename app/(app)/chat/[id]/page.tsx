import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ChatInterface } from "../chat-interface";

export const metadata = { title: "Chat" };

export default async function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: conversation } = await supabase
    .from("imm_ai_conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("imm_ai_messages")
    .select("role, content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const initialMessages = (messages ?? [])
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] glass rounded-xl">
      <div className="p-4 border-b border-border">
        <h1 className="font-semibold">{conversation.title}</h1>
        <p className="text-xs text-muted-foreground capitalize">{conversation.context_type}</p>
      </div>
      <ChatInterface conversationId={id} initialMessages={initialMessages} />
    </div>
  );
}
