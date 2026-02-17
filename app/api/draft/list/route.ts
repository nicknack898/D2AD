import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { requireAdminApi } from "@/lib/auth"

/**
 * GET /api/draft/list
 * Returns all draft sessions ordered by most recent first.
 */
export async function GET() {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied
    const supabase = await createClient()
    const { data: sessions, error } = await supabase
      .from("draft_sessions")
      .select("*, events(name)")
      .order("created_at", { ascending: false })
    if (error) throw error

    const data = (sessions ?? []).map((s: any) => ({
      ...s,
      event_name: s.events?.name ?? null,
      events: undefined,
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error("Draft list error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
