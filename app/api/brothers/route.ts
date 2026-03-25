import { NextResponse } from "next/server";
import { loadStore } from "@/lib/wisdom-search";

export async function GET() {
  try {
    const store = loadStore();
    const brotherMap: Record<
      string,
      { count: number; themes: Record<string, number>; topQuotes: string[] }
    > = {};

    for (const unit of store.units) {
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
      .map(([name, data]) => {
        const firstName = name.split(" ")[0];
        const sortedThemes = Object.entries(data.themes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([theme, count]) => ({ theme, count }));

        return {
          name,
          displayName: `Brother ${firstName}`,
          slug: firstName.toLowerCase(),
          wisdomCount: data.count,
          dominantThemes: sortedThemes,
          topQuotes: data.topQuotes,
        };
      })
      .sort((a, b) => b.wisdomCount - a.wisdomCount);

    return NextResponse.json({ brothers, totalWisdom: store.total_units });
  } catch (error) {
    console.error("Brothers route error:", error);
    return NextResponse.json({ brothers: [], totalWisdom: 0 }, { status: 200 });
  }
}
