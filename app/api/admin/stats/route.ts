import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Count pending players across all events
    const { count: pendingPlayers } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Count total players
    const { count: totalPlayers } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })

    // Count active events (registration_open)
    const { count: activeEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "registration_open")

    return NextResponse.json({
      pending_players: pendingPlayers ?? 0,
      total_players: totalPlayers ?? 0,
      active_events: activeEvents ?? 0,
    })
  } catch (err) {
    console.error("Admin stats error:", err)
    return NextResponse.json({ pending_players: 0, total_players: 0, active_events: 0 })
  }
}
