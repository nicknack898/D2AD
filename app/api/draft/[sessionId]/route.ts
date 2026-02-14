import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getDraftSession, getLotsForSession, getSeatsForSession } from "@/lib/draft-engine"

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
