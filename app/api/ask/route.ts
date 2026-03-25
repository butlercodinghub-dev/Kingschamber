import { NextRequest, NextResponse } from "next/server";
import { searchWisdom } from "@/lib/wisdom-search";
import { synthesizeWisdom } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = (body.question || "").trim().slice(0, 500);

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const results = await searchWisdom(question, 5);

    if (results.length === 0) {
      return NextResponse.json({
        quote:
          "The Chamber offers no answer today. Return when your question has matured.",
        author: "Council of Kings",
        theme: "patience",
      });
    }

    const wisdomUnits = results.map((r) => ({
      text: r.unit.text,
      primary_author: r.unit.primary_author,
      theme: r.unit.theme,
    }));

    // Source data for "Reveal Origin"
    const sources = results.slice(0, 3).map((r) => ({
      text: r.unit.text,
      author: r.unit.primary_author,
    }));

    const response = await synthesizeWisdom(question, wisdomUnits);
    return NextResponse.json({ ...response, sources });
  } catch (error) {
    console.error("Ask route error:", error);
    return NextResponse.json(
      {
        quote:
          "The Chamber is momentarily silent. A king does not repeat himself — he waits.",
        author: "Council of Kings",
        theme: "patience",
      },
      { status: 200 }
    );
  }
}
