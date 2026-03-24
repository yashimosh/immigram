import OpenAI from "openai";

let clientInstance: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = new OpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: process.env.AI_API_KEY,
    });
  }
  return clientInstance;
}

/** Default model — local Ollama, good for chat and general tasks. */
export const MODEL_FAST = "qwen3.5:4b";

/** Smart model — Anthropic Claude, for complex legal/analysis. */
export const MODEL_SMART = "claude-sonnet";

/** Embedding model — for RAG, semantic search, similarity. */
export const MODEL_EMBEDDING = "qwen3-embedding";

/** Default max tokens for completions. */
export const DEFAULT_MAX_TOKENS = 4096;

export interface CompletionOptions {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function getCompletion({
  systemPrompt,
  userMessage,
  model = MODEL_FAST,
  maxTokens = DEFAULT_MAX_TOKENS,
  temperature,
}: CompletionOptions): Promise<string> {
  const client = getAIClient();

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    ...(temperature !== undefined && { temperature }),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
