import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY env var");
  return new GoogleGenerativeAI(apiKey);
}

function getFlashModel() {
  return getGenAI().getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

function getEmbeddingModel() {
  return getGenAI().getGenerativeModel({ model: "gemini-embedding-001" });
}

// Retry wrapper for Gemini API calls
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("Service Unavailable");

      if (!isRetryable || attempt === maxRetries) throw err;

      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retry exhausted");
}

export async function embedText(text: string): Promise<number[]> {
  return withRetry(async () => {
    const result = await getEmbeddingModel().embedContent({
      content: { parts: [{ text }], role: "user" },
      taskType: "SEMANTIC_SIMILARITY" as never,
    });
    return result.embedding.values;
  });
}

export async function synthesizeWisdom(
  question: string,
  wisdomUnits: { text: string; primary_author: string; theme: string }[]
): Promise<{ quote: string; author: string; theme: string }> {
  const unitsText = wisdomUnits
    .map((u, i) => `[${i + 1}] "${u.text}" — ${u.primary_author}`)
    .join("\n");

  const prompt = `You are the voice of the King's Chamber — a sacred archive of collective male wisdom.

A seeker has asked: "${question}"

The following wisdom fragments have been retrieved from the Chamber's archive:

${unitsText}

Your task: Synthesize a single philosophical response. It must:
- Directly address the seeker's question
- Draw from the wisdom provided (do not invent new ideas)
- Speak in second person ("A king who..." or "The man who...")
- Be 1-3 sentences maximum
- Sound ancient, deliberate, and final — not conversational

Return ONLY valid JSON with no markdown, no code blocks:
{"quote": "...", "author": "Brother Name or Council of Kings", "theme": "..."}`;

  return withRetry(async () => {
    const result = await getFlashModel().generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const first = wisdomUnits[0];
      return {
        quote: first.text,
        author: first.primary_author,
        theme: first.theme,
      };
    }
  });
}

export async function deepenWisdom(
  quote: string,
  author: string,
  question: string
): Promise<string> {
  const prompt = `You are the voice of the King's Chamber — a sacred archive of collective male wisdom.

A seeker asked: "${question}"
The Chamber responded: "${quote}" — ${author}

The seeker wishes to go deeper. Expand this wisdom into a 3-5 sentence philosophical reflection.
- Stay true to the original insight — do not contradict it
- Add depth, context, and actionable clarity
- Maintain the same tone: masculine, deliberate, reflective
- Do not use bullet points or lists
- Write as flowing prose

Return ONLY the expanded reflection text, no JSON, no quotes, no attribution.`;

  return withRetry(async () => {
    const result = await getFlashModel().generateContent(prompt);
    return result.response.text().trim();
  });
}
