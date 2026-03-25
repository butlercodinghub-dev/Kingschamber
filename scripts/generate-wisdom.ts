import path from "path";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedMessage } from "../types/wisdom";

const APP_ROOT = "/Users/renobutler/Desktop/KINGS CHAMBER APP/kings-chamber";
const BATCH_SIZE = 80;
const SLEEP_MS = 4200;
const CHECKPOINT_EVERY = 50;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface RawWisdomUnit {
  text: string;
  authors: string[];
  source_preview: string;
  theme: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const VALID_THEMES = new Set([
  "discipline", "money", "mindset", "relationships", "masculinity",
  "legacy", "risk", "brotherhood", "spirituality", "observation",
]);

async function extractWisdom(batch: ParsedMessage[]): Promise<RawWisdomUnit[]> {
  const batchText = batch
    .map((m) => `[${m.name}]: ${m.text}`)
    .join("\n");

  const prompt = `You are distilling philosophical wisdom from a private group chat between close male friends.

Below are real messages from this chat. Your task is to identify any exchanges, statements, or threads that contain genuine insight about life, money, discipline, relationships, mindset, masculinity, risk, or legacy.

Extract 2-4 wisdom units. Each unit must:
- Be a single refined, complete sentence or short paragraph (not a bullet list)
- Read as a timeless philosophical statement (not slang, not casual)
- Preserve the original meaning without sanitizing the perspective
- Sound like something worth carving into stone

For each unit, identify:
- The exact author name(s) from the messages (use the names exactly as they appear)
- A theme: one of [discipline, money, mindset, relationships, masculinity, legacy, risk, brotherhood, spirituality, observation]
- A source_preview: 8 words or fewer hinting at what sparked the wisdom (do not quote directly)

Return ONLY valid JSON with no markdown. Format:
[{"text": "...", "authors": ["Name"], "source_preview": "...", "theme": "..."}]

If there is no genuine wisdom in this batch, return an empty array: []

MESSAGES:
${batchText}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((u: RawWisdomUnit) => {
      if (typeof u.text !== "string" || u.text.split(" ").length < 8) return false;
      if (!Array.isArray(u.authors) || u.authors.length === 0) return false;
      if (!VALID_THEMES.has(u.theme)) u.theme = "observation";
      return true;
    });
  } catch {
    return [];
  }
}

async function main() {
  const messagesPath = path.join(APP_ROOT, "data/parsed-messages.json");
  const partialPath = path.join(APP_ROOT, "data/wisdom-partial.json");
  const outputPath = path.join(APP_ROOT, "data/wisdom-raw.json");

  if (!fs.existsSync(messagesPath)) {
    console.error("Run parse-chat.ts first to generate parsed-messages.json");
    process.exit(1);
  }

  const messages: ParsedMessage[] = JSON.parse(
    fs.readFileSync(messagesPath, "utf-8")
  );
  console.log(`Loaded ${messages.length} messages`);

  // Resume from checkpoint if exists
  let allUnits: RawWisdomUnit[] = [];
  let startBatch = 0;

  if (fs.existsSync(partialPath)) {
    const partial = JSON.parse(fs.readFileSync(partialPath, "utf-8"));
    allUnits = partial.units || [];
    startBatch = partial.lastBatch + 1;
    console.log(
      `Resuming from batch ${startBatch} (${allUnits.length} units so far)`
    );
  }

  const totalBatches = Math.ceil(messages.length / BATCH_SIZE);
  console.log(`Total batches: ${totalBatches}`);
  console.log(
    `Estimated time: ${Math.round(((totalBatches - startBatch) * SLEEP_MS) / 60000)} minutes\n`
  );

  for (let i = startBatch; i < totalBatches; i++) {
    const batch = messages.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    process.stdout.write(`Batch ${i + 1}/${totalBatches}... `);

    try {
      const units = await extractWisdom(batch);
      allUnits.push(...units);
      process.stdout.write(`${units.length} units extracted (total: ${allUnits.length})\n`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`\nRate limited. Waiting 60 seconds...`);
        await sleep(60000);
        i--; // Retry this batch
        continue;
      }
      console.error(`\nError on batch ${i}: ${errMsg}`);
    }

    // Checkpoint
    if ((i + 1) % CHECKPOINT_EVERY === 0) {
      fs.writeFileSync(
        partialPath,
        JSON.stringify({ lastBatch: i, units: allUnits })
      );
      console.log(`  [Checkpoint saved: ${allUnits.length} units total]`);
    }

    if (i < totalBatches - 1) {
      await sleep(SLEEP_MS);
    }
  }

  // Save final output
  fs.writeFileSync(outputPath, JSON.stringify(allUnits, null, 2));
  console.log(`\nDone! ${allUnits.length} wisdom units saved to ${outputPath}`);

  // Clean up partial
  if (fs.existsSync(partialPath)) fs.unlinkSync(partialPath);
}

main().catch(console.error);
