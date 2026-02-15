import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import crypto from "crypto"

/**
 * POST /api/draft/[sessionId]/codes
 * Admin actions: regenerate or revoke a captain code.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const json = await req.json().catch(() => null)
    if (!json || !json._action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = await createClient()
    const { _action, seat_label } = json

    if (!seat_label) {
      return NextResponse.json({ error: "seat_label is required" }, { status: 400 })
    }

    // Find the seat
    const { data: seat, error: seatErr } = await supabase
      .from("captain_seats")
      .select("id, seat_label")
      .eq("draft_session_id", sessionId)
      .eq("seat_label", seat_label)
      .maybeSingle()

    if (seatErr) throw seatErr
    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    if (_action === "regenerate") {
      // Generate a new code and replace the existing one
      const newCode = crypto.randomBytes(4).toString("hex").toUpperCase()

      // Delete old code(s) for this seat
      await supabase
        .from("captain_codes")
        .delete()
        .eq("seat_id", seat.id)

      // Insert new code
      const { error: insertErr } = await supabase
        .from("captain_codes")
        .insert({ seat_id: seat.id, code: newCode, used: false })

      if (insertErr) throw insertErr

      return NextResponse.json({ success: true, new_code: newCode })
    }

    if (_action === "revoke") {
      // Mark the code as used so it cannot be redeemed
      const { error: updateErr } = await supabase
        .from("captain_codes")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("seat_id", seat.id)
        .eq("used", false)

      if (updateErr) throw updateErr

      return NextResponse.json({ success: true, message: "Code revoked" })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err) {
    console.error("Captain codes action error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/draft/[sessionId]/codes
 * Admin-only: returns captain codes for a given draft session.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const supabase = await createClient()

    const { data: codes, error } = await supabase
      .from("captain_codes")
      .select("code, used, captain_seats(seat_label, captain_name)")
      .eq("captain_seats.draft_session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      // Fallback: query via captain_seats first
      const { data: seats, error: sErr } = await supabase
        .from("captain_seats")
        .select("id, seat_label, captain_name, captain_codes(code, used)")
        .eq("draft_session_id", sessionId)
        .order("seat_label", { ascending: true })

      if (sErr) throw sErr

      const seatCodes = (seats ?? []).map((s: any) => ({
        seat_label: s.seat_label,
        captain_name: s.captain_name,
        code: s.captain_codes?.[0]?.code ?? "N/A",
        used: s.captain_codes?.[0]?.used ?? false,
      }))

      return NextResponse.json({ codes: seatCodes })
    }

    const mapped = (codes ?? []).map((c: any) => ({
      seat_label: c.captain_seats?.seat_label ?? "Unknown",
      captain_name: c.captain_seats?.captain_name ?? "",
      code: c.code,
      used: c.used,
    }))

    return NextResponse.json({ codes: mapped })
  } catch (err) {
    console.error("Codes fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
