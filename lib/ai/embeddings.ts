import { getAIClient, MODEL_EMBEDDING } from "./client";

export async function getEmbedding(text: string): Promise<number[]> {
  const client = getAIClient();
  const response = await client.embeddings.create({
    model: MODEL_EMBEDDING,
    input: text,
  });
  return response.data[0].embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getAIClient();
  const response = await client.embeddings.create({
    model: MODEL_EMBEDDING,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

export function chunkText(text: string, maxChunkSize = 512, overlap = 50): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      // Keep overlap from end of current chunk
      const words = current.split(" ");
      current = words.slice(-Math.ceil(overlap / 5)).join(" ") + " " + sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkSize)];
}
