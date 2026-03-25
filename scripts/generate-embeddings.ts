import path from "path";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { WisdomUnit, WisdomStore } from "../types/wisdom";

const APP_ROOT = "/Users/renobutler/Desktop/KINGS CHAMBER APP/kings-chamber";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

function buildPrimaryAuthor(authors: string[]): string {
  if (authors.length === 1) {
    const firstName = authors[0].trim().split(" ")[0];
    return `Brother ${firstName}`;
  }
  return "Council of Kings";
}

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: "SEMANTIC_SIMILARITY" as never,
  });
  return result.embedding.values;
}

async function main() {
  const rawPath = path.join(APP_ROOT, "data/wisdom-raw.json");
  const outputPath = path.join(APP_ROOT, "data/wisdom.json");

  if (!fs.existsSync(rawPath)) {
    console.error("Run generate-wisdom.ts first");
    process.exit(1);
  }

  const rawUnits = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
  console.log(`Embedding ${rawUnits.length} wisdom units...`);

  const units: WisdomUnit[] = [];

  for (let i = 0; i < rawUnits.length; i++) {
    const raw = rawUnits[i];
    process.stdout.write(`[${i + 1}/${rawUnits.length}] Embedding... `);

    try {
      const embedding = await embedText(raw.text);
      const unit: WisdomUnit = {
        id: uuidv4(),
        text: raw.text,
        authors: raw.authors,
        primary_author: buildPrimaryAuthor(raw.authors),
        source_preview: raw.source_preview || "",
        embedding,
        theme: raw.theme || "observation",
        created_at: new Date().toISOString(),
      };
      units.push(unit);
      process.stdout.write("done\n");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`\nRate limited. Waiting 30 seconds...`);
        await new Promise((r) => setTimeout(r, 30000));
        i--; // Retry
        continue;
      }
      console.error(`\nFailed to embed unit ${i}: ${errMsg}`);
    }

    // Small delay to avoid rate limits
    if (i < rawUnits.length - 1 && (i + 1) % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const store: WisdomStore = {
    generated_at: new Date().toISOString(),
    total_units: units.length,
    units,
  };

  fs.writeFileSync(outputPath, JSON.stringify(store));
  console.log(`\nDone! ${units.length} units with embeddings saved to ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(console.error);
