import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET — fetch all saved quotes
export async function GET() {
  const { data, error } = await supabase
    .from("saved_quotes")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Scroll fetch error:", error.message);
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data);
}

// POST — save a new quote
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { quote, author, theme } = body;

  if (!quote || !author) {
    return NextResponse.json({ error: "quote and author required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("saved_quotes")
    .insert({ quote, author, theme: theme || "" })
    .select()
    .single();

  if (error) {
    console.error("Scroll save error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — remove a saved quote
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_quotes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Scroll delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
