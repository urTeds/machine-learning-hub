import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Article } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, author_id")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Articles API error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data as Article[] });
  } catch (err) {
    console.error("Articles API exception:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
