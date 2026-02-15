import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyCaptainToken } from "@/lib/captain-jwt"
import { placeBid, getActiveLot } from "@/lib/draft-engine"
import { placeBidSchema } from "@/lib/validation"

/**
 * POST /api/draft/[sessionId]/bid
 * Body: { lot_id, amount }
 * Auth: captain_token cookie (JWT with seat_id)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("captain_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated as captain" }, { status: 401 })
    }

    let captain
    try {
      captain = await verifyCaptainToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid or expired captain token" }, { status: 401 })
    }

    if (captain.session_id !== sessionId) {
      return NextResponse.json({ error: "Token does not match this draft session" }, { status: 403 })
    }

    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = placeBidSchema.safeParse({
      lot_id: json.lot_id,
      seat_id: captain.seat_id,
      amount: json.amount,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    // Verify the lot belongs to this session
    const activeLot = await getActiveLot(sessionId)
    if (!activeLot || activeLot.id !== parsed.data.lot_id) {
      return NextResponse.json({ error: "This lot is not currently active" }, { status: 409 })
    }

    const bid = await placeBid(parsed.data.lot_id, parsed.data.seat_id, parsed.data.amount)

    return NextResponse.json({ success: true, bid })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message === "LOT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Lot is no longer active" }, { status: 409 })
    }
    if (message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({ error: "Insufficient budget" }, { status: 422 })
    }
    if (message === "BID_TOO_LOW") {
      return NextResponse.json({ error: "Bid must be higher than current top bid" }, { status: 422 })
    }
    console.error("Bid error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
