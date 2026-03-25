import { NextResponse } from "next/server";
import { getDailyWisdom } from "@/lib/wisdom-search";

export async function GET() {
  try {
    const wisdom = await getDailyWisdom();
    return NextResponse.json(wisdom);
  } catch (error) {
    console.error("Daily wisdom error:", error);
    return NextResponse.json(
      {
        quote:
          "Patience is the throne upon which all great things are built.",
        author: "Council of Kings",
        theme: "patience",
      },
      { status: 200 }
    );
  }
}
