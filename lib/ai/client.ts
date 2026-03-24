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

/** Fast model — Groq free tier, good for chat and simple tasks. */
export const MODEL_FAST = "llama-3.3-70b";

/** Smart model — Anthropic Claude, for complex legal/analysis. */
export const MODEL_SMART = "claude-sonnet";

/** Multilingual model — best for Persian/Kurdish/Arabic documents. */
export const MODEL_MULTILINGUAL = "qwen3.5:4b";

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
