import { supabase } from "./supabase";
import { SearchResult, WisdomUnit } from "@/types/wisdom";
import { embedText } from "./gemini";

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

export async function searchWisdom(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await embedText(query);
  const brotherNames = detectBrother(query);

  const { data, error } = await supabase.rpc("match_wisdom", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: topK,
    filter_authors: brotherNames,
  });

  if (error) {
    console.error("Supabase search error:", error.message);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    unit: {
      id: row.id as string,
      text: row.text as string,
      authors: row.authors as string[],
      primary_author: row.primary_author as string,
      source_preview: row.source_preview as string,
      theme: row.theme as string,
      created_at: row.created_at as string,
      embedding: [],
    } as WisdomUnit,
    score: row.similarity as number,
  }));
}

export async function getDailyWisdom() {
  const { data, error } = await supabase.rpc("get_daily_wisdom");

  if (error || !data || data.length === 0) {
    return {
      quote:
        "The Chamber is being prepared. Return when the wisdom has been gathered.",
      author: "Council of Kings",
      theme: "patience",
    };
  }

  return {
    quote: data[0].quote,
    author: data[0].author,
    theme: data[0].theme,
  };
}

export async function getAllBrothers() {
  const { data, error } = await supabase
    .from("wisdom_units")
    .select("text, authors, primary_author, theme");

  if (error || !data) {
    console.error("Failed to load brothers:", error?.message);
    return { brothers: [], totalWisdom: 0 };
  }

  const brotherMap: Record<
    string,
    { count: number; themes: Record<string, number>; topQuotes: string[] }
  > = {};

  for (const unit of data) {
    for (const author of unit.authors) {
      if (!brotherMap[author]) {
        brotherMap[author] = { count: 0, themes: {}, topQuotes: [] };
      }
      const b = brotherMap[author];
      b.count++;
      b.themes[unit.theme] = (b.themes[unit.theme] || 0) + 1;
      if (b.topQuotes.length < 5) {
        b.topQuotes.push(unit.text);
      }
    }
  }

  const brothers = Object.entries(brotherMap)
    .map(([name, d]) => {
      const firstName = name.split(" ")[0];
      const sortedThemes = Object.entries(d.themes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, count }));

      return {
        name,
        displayName: `Brother ${firstName}`,
        slug: firstName.toLowerCase(),
        wisdomCount: d.count,
        dominantThemes: sortedThemes,
        topQuotes: d.topQuotes,
      };
    })
    .sort((a, b) => b.wisdomCount - a.wisdomCount);

  return { brothers, totalWisdom: data.length };
}
