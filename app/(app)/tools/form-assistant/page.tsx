"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

const FORM_TYPES = [
  { value: "ds-160", label: "DS-160 (US Nonimmigrant Visa)" },
  { value: "i-130", label: "I-130 (US Family Petition)" },
  { value: "i-140", label: "I-140 (US Employment Petition)" },
  { value: "uk-visa", label: "UK Visa Application" },
  { value: "uk-skilled-worker", label: "UK Skilled Worker Visa" },
  { value: "canada-express-entry", label: "Canada Express Entry" },
  { value: "canada-study-permit", label: "Canada Study Permit" },
  { value: "australia-482", label: "Australia 482 (TSS Visa)" },
  { value: "australia-189", label: "Australia 189 (Skilled Independent)" },
  { value: "schengen", label: "Schengen Visa Application" },
  { value: "germany-blue-card", label: "Germany EU Blue Card" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FormAssistantPage() {
  const [formType, setFormType] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function handleSelectForm(type: string) {
    setFormType(type);
    const label = FORM_TYPES.find((f) => f.value === type)?.label ?? type;
    setMessages([
      {
        role: "assistant",
        content: `I'll help you fill out the **${label}** form. I'll guide you through each section step by step.\n\nLet's start! Tell me a bit about yourself and the purpose of your application, and I'll walk you through what you need to fill in.`,
      },
    ]);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/form-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          form_type: formType,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return updated;
              });
            } catch {
              // skip
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  }

  // Form selection screen
  if (!formType) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Form Filling Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Get step-by-step guidance for filling out immigration forms
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4">Select a Form</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FORM_TYPES.map((f) => (
              <button
                key={f.value}
                onClick={() => handleSelectForm(f.value)}
                className="rounded-lg border border-border bg-input px-4 py-3 text-sm text-left hover:border-primary/50 hover:bg-white/[0.03] transition-colors flex items-center gap-3"
              >
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Form Filling Assistant</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {FORM_TYPES.find((f) => f.value === formType)?.label}
            </p>
          </div>
          <button
            onClick={() => {
              setFormType("");
              setMessages([]);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/50"
          >
            Change Form
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col glass rounded-xl overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="glass rounded-xl px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the form or provide your details..."
              className="flex-1 rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI assistant for informational purposes only. Always verify form
            entries against official guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
