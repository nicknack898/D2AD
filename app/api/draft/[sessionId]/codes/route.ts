import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

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
