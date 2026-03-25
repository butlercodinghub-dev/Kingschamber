import { NextResponse } from "next/server";
import { getAllBrothers } from "@/lib/wisdom-search";

export async function GET() {
  try {
    const result = await getAllBrothers();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Brothers route error:", error);
    return NextResponse.json({ brothers: [], totalWisdom: 0 }, { status: 200 });
  }
}
