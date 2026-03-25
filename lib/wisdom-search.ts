import path from "path";
import fs from "fs";
import { WisdomStore, WisdomUnit, SearchResult } from "@/types/wisdom";
import { cosineSimilarity } from "./embeddings";
import { embedText } from "./gemini";

let _store: WisdomStore | null = null;

// Map of recognized brother names to their full author strings in the data
const BROTHER_ALIASES: Record<string, string[]> = {
  bobby: ["Bobby Chen"],
  bradley: ["Bradley Watson"],
  brad: ["Bradley Watson"],
  daniel: ["Daniel Hanna"],
  jarrod: ["Jarrod"],
  jeremy: ["Jeremy Kemp"],
  kriston: ["Kriston Moore"],
  matthew: ["Matthew Reid"],
  matt: ["Matthew Reid"],
  michael: ["Michael England"],
  mike: ["Michael England"],
  pericles: ["Pericles A. Maillis"],
  reno: ["Reno"],
};

function detectBrother(query: string): string[] | null {
  const lower = query.toLowerCase();
  for (const [alias, fullNames] of Object.entries(BROTHER_ALIASES)) {
    if (lower.includes(alias)) {
      return fullNames;
    }
  }
  return null;
}

export function loadStore(): WisdomStore {
  if (_store) return _store;

  const candidates = [
    path.join(process.cwd(), "data", "wisdom.json"),
    path.join(process.cwd(), "kings-chamber", "data", "wisdom.json"),
    path.resolve(__dirname, "..", "data", "wisdom.json"),
  ];

  const foundPath = candidates.find((p) => fs.existsSync(p));

  if (!foundPath) {
    console.warn("wisdom.json not found. Tried:", candidates);
    return { generated_at: "", total_units: 0, units: [] };
  }

  console.log(`Loading wisdom store from: ${foundPath}`);
  const raw = fs.readFileSync(foundPath, "utf-8");
  _store = JSON.parse(raw) as WisdomStore;
  console.log(`Loaded ${_store.total_units} wisdom units`);
  return _store;
}

export async function searchWisdom(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const store = loadStore();
  if (store.units.length === 0) return [];

  const queryEmbedding = await embedText(query);
  const brotherNames = detectBrother(query);

  let pool: WisdomUnit[];
  if (brotherNames) {
    // Filter to only this brother's wisdom
    pool = store.units.filter((u) =>
      u.authors.some((a) => brotherNames.includes(a))
    );
    // If too few results from this brother, fall back to full pool
    if (pool.length < topK) {
      pool = store.units;
    }
  } else {
    pool = store.units;
  }

  const scored = pool.map((unit) => ({
    unit,
    score: cosineSimilarity(queryEmbedding, unit.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

export function getDailyWisdom() {
  const store = loadStore();
  if (store.units.length === 0) {
    return {
      quote:
        "The Chamber is being prepared. Return when the wisdom has been gathered.",
      author: "Council of Kings",
      theme: "patience",
    };
  }
  const dayIndex =
    Math.floor(Date.now() / 86400000) % store.units.length;
  const unit = store.units[dayIndex];
  return {
    quote: unit.text,
    author: unit.primary_author,
    theme: unit.theme,
  };
}
