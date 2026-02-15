import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyCaptainToken } from "@/lib/captain-jwt"
import { createClient } from "@/lib/supabase-server"

/**
 * GET /api/draft/[sessionId]/auth
 * Checks if the user has a valid captain_token cookie for this session.
 * Returns seat info if authenticated, or { authenticated: false }.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("captain_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    let captain
    try {
      captain = await verifyCaptainToken(token)
    } catch {
      return NextResponse.json({ authenticated: false })
    }

    if (captain.session_id !== sessionId) {
      return NextResponse.json({ authenticated: false })
    }

    // Fetch seat info
    const supabase = await createClient()
    const { data: seat } = await supabase
      .from("captain_seats")
      .select("id, seat_label, captain_name")
      .eq("id", captain.seat_id)
      .maybeSingle()

    if (!seat) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      seat: {
        id: seat.id,
        seat_label: seat.seat_label,
        captain_name: seat.captain_name,
      },
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
