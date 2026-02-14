import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

/**
 * GET /api/draft/list
 * Returns all draft sessions ordered by most recent first.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("draft_sessions")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ sessions: data ?? [] })
  } catch (err) {
    console.error("Draft list error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
