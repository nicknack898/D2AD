import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import { signCaptainToken } from "@/lib/captain-jwt"
import { redeemCodeSchema } from "@/lib/validation"
import crypto from "crypto"

/**
 * POST /api/draft/[sessionId]/redeem
 * Body: { code }
 * Validates a one-time captain code, marks it used, and returns
 * an httpOnly JWT cookie (`captain_token`) for the captain's seat.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const normalizedCode = String(json.code ?? "").trim().toUpperCase()
    const parsed = redeemCodeSchema.safeParse({ code: normalizedCode, session_id: sessionId })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const codeHash = crypto.createHash("sha256").update(parsed.data.code).digest("hex")

    // Look up the code by hash first (secure path), with a fallback for legacy rows
    let { data: codeRow, error: codeErr } = await supabase
      .from("captain_codes")
      .select("*, captain_seats(id, seat_label, captain_name, draft_session_id)")
      .eq("code_hash", codeHash)
      .maybeSingle()

    if (codeErr) throw codeErr

    if (!codeRow) {
      const legacyLookup = await supabase
        .from("captain_codes")
        .select("*, captain_seats(id, seat_label, captain_name, draft_session_id)")
        .eq("code", parsed.data.code)
        .maybeSingle()

      if (legacyLookup.error) throw legacyLookup.error
      codeRow = legacyLookup.data
    }

    if (!codeRow) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 })
    }

    if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 410 })
    }

    if (codeRow.used) {
      return NextResponse.json({ error: "This code has already been used" }, { status: 409 })
    }

    const seat = codeRow.captain_seats
    if (!seat || seat.draft_session_id !== sessionId) {
      return NextResponse.json({ error: "Code does not belong to this draft session" }, { status: 403 })
    }

    // Mark code as used
    const { error: markErr } = await supabase
      .from("captain_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", codeRow.id)
    if (markErr) throw markErr

    // Sign JWT
    const token = await signCaptainToken({
      seat_id: seat.id,
      session_id: sessionId,
      label: seat.seat_label,
    })

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set("captain_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    })

    return NextResponse.json({
      success: true,
      seat: {
        id: seat.id,
        seat_label: seat.seat_label,
        captain_name: seat.captain_name,
      },
    })
  } catch (err) {
    console.error("Redeem error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
