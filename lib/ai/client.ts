import Anthropic from "@anthropic-ai/sdk";

let clientInstance: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!clientInstance) {
    clientInstance = new Anthropic();
  }
  return clientInstance;
}

/** Fast model — low latency, good for chat and simple tasks. */
export const MODEL_FAST = "claude-haiku-4-5-20250414";

/** Smart model — higher quality, used for analysis and complex reasoning. */
export const MODEL_SMART = "claude-sonnet-4-20250514";

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
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(temperature !== undefined && { temperature }),
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}
