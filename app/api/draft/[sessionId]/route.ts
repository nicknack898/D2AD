import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getDraftSession, getLotsForSession, getSeatsForSession } from "@/lib/draft-engine"
import { requireAdminApi } from "@/lib/auth"

/**
 * DELETE /api/draft/[sessionId]
 * Admin-only: deletes a draft session and all related data (cascade via foreign keys,
 * or manual deletion if no cascade is set up).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied
    const { sessionId } = await params
    const supabase = await createClient()

    // Get seats to delete related codes and wallets
    const { data: seats } = await supabase
      .from("captain_seats")
      .select("id")
      .eq("draft_session_id", sessionId)

    const seatIds = (seats ?? []).map((s) => s.id)

    if (seatIds.length > 0) {
      // Delete captain_codes for these seats
      await supabase.from("captain_codes").delete().in("seat_id", seatIds)
      // Delete wallets for these seats
      await supabase.from("wallets").delete().in("seat_id", seatIds)
    }

    // Get lot IDs to delete bids (bids table has no draft_session_id column)
    const { data: lots } = await supabase
      .from("lots")
      .select("id")
      .eq("draft_session_id", sessionId)
    const lotIds = (lots ?? []).map((l) => l.id)
    if (lotIds.length > 0) {
      await supabase.from("bids").delete().in("lot_id", lotIds)
    }
    // Delete lots
    await supabase.from("lots").delete().eq("draft_session_id", sessionId)
    // Delete captain seats
    await supabase.from("captain_seats").delete().eq("draft_session_id", sessionId)
    // Delete the session itself
    const { error: delErr } = await supabase.from("draft_sessions").delete().eq("id", sessionId)
    if (delErr) throw delErr

    return NextResponse.json({ success: true, message: "Draft session deleted" })
  } catch (err) {
    console.error("Draft DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/draft/[sessionId]
 * Returns the full draft state: session, lots (with player names), seats + wallets.
 * This is the single polling/initial-load endpoint for spectators and captains.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const session = await getDraftSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Draft session not found" }, { status: 404 })
    }

    const [lots, seats] = await Promise.all([
      getLotsForSession(sessionId),
      getSeatsForSession(sessionId),
    ])

    // Enrich lots with player display names
    const supabase = await createClient()
    const playerIds = lots.map((l) => l.player_id).filter(Boolean)
    let playerMap: Record<string, { display_name: string; discord_id: string | null }> = {}
    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from("players")
        .select("id, display_name, discord_id")
        .in("id", playerIds)
      if (players) {
        playerMap = Object.fromEntries(
          players.map((p) => [p.id, { display_name: p.display_name, discord_id: p.discord_id }]),
        )
      }
    }

    const enrichedLots = lots.map((lot) => ({
      ...lot,
      player: playerMap[lot.player_id] ?? { display_name: "Unknown", discord_id: null },
    }))

    return NextResponse.json({
      session,
      lots: enrichedLots,
      seats: seats.map((s) => ({
        id: s.id,
        seat_label: s.seat_label,
        captain_name: s.captain_name,
        budget: s.budget,
        balance: s.wallet?.balance ?? s.budget,
      })),
    })
  } catch (err) {
    console.error("Draft GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
