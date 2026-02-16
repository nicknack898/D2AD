import { NextResponse } from "next/server"
import { getDraftSession, getActiveLot, closeLot, openNextLot, setPhase } from "@/lib/draft-engine"
import { requireAdminApiAuth } from "@/lib/admin-auth"

/**
 * POST /api/draft/[sessionId]/advance
 * Admin-only: closes the active lot, deducts from winner's wallet,
 * and opens the next lot. If no lots remain, sets phase to "finished".
 *
 * Body (optional): { action: "start" | "pause" | "resume" | "close_lot" }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const isAdmin = await requireAdminApiAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params
    const session = await getDraftSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Draft session not found" }, { status: 404 })
    }

    const json = await req.json().catch(() => ({}))
    const action = json.action ?? "close_lot"

    // Handle phase controls
    if (action === "start") {
      if (session.phase !== "lobby") {
        return NextResponse.json({ error: "Draft already started" }, { status: 409 })
      }
      const lot = await openNextLot(sessionId)
      return NextResponse.json({ success: true, phase: "picking", lot })
    }

    if (action === "pause") {
      await setPhase(sessionId, "paused")
      return NextResponse.json({ success: true, phase: "paused" })
    }

    if (action === "resume") {
      await setPhase(sessionId, "picking")
      return NextResponse.json({ success: true, phase: "picking" })
    }

    // Default: close active lot and open next
    const activeLot = await getActiveLot(sessionId)
    if (!activeLot) {
      return NextResponse.json({ error: "No active lot to close" }, { status: 409 })
    }

    const result = await closeLot(activeLot.id)
    const nextLot = await openNextLot(sessionId)

    if (!nextLot) {
      // No more lots, draft is finished
      await setPhase(sessionId, "finished")
      return NextResponse.json({
        success: true,
        closed: { lot_id: activeLot.id, ...result },
        next: null,
        phase: "finished",
      })
    }

    return NextResponse.json({
      success: true,
      closed: { lot_id: activeLot.id, ...result },
      next: nextLot,
      phase: "picking",
    })
  } catch (err) {
    console.error("Advance error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
