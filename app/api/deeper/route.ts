import { NextRequest, NextResponse } from "next/server";
import { deepenWisdom } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quote, author, question } = body;

    if (!quote) {
      return NextResponse.json({ error: "Quote is required" }, { status: 400 });
    }

    const expanded = await deepenWisdom(
      quote,
      author || "Council of Kings",
      question || ""
    );

    return NextResponse.json({ expanded });
  } catch (error) {
    console.error("Deeper route error:", error);
    return NextResponse.json(
      { expanded: "The Chamber chooses not to elaborate. Some truths are complete as they stand." },
      { status: 200 }
    );
  }
}
