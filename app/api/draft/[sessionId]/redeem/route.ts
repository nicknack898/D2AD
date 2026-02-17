import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import { signCaptainToken } from "@/lib/captain-jwt"
import { redeemCodeSchema } from "@/lib/validation"
import crypto from "crypto"

// ---------- simple in-memory rate limit for code redemption ----------
const redeemAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_REDEEM_ATTEMPTS = 10
const REDEEM_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getIp(hdrs: Headers): string {
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown"
}

/**
 * POST /api/draft/[sessionId]/redeem
 * Body: { code }
 * Validates a one-time captain code (looked up by SHA-256 hash),
 * marks it used, checks expiry, and returns an httpOnly JWT cookie
 * (`captain_token`) for the captain's seat.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params

    // --- Rate limit by IP + session ---
    const hdrs = headers()
    const ip = getIp(hdrs)
    const rateKey = `${ip}|${sessionId}`
    const now = Date.now()
    const record = redeemAttempts.get(rateKey)

    if (record) {
      if (now - record.firstAttempt > REDEEM_WINDOW_MS) {
        redeemAttempts.set(rateKey, { count: 1, firstAttempt: now })
      } else if (record.count >= MAX_REDEEM_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many redemption attempts. Please try again later." },
          { status: 429 },
        )
      } else {
        record.count += 1
      }
    } else {
      redeemAttempts.set(rateKey, { count: 1, firstAttempt: now })
    }

    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = redeemCodeSchema.safeParse({ code: json.code, session_id: sessionId })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Hash the submitted code and look up by hash (timing-safe)
    const codeHash = crypto.createHash("sha256").update(parsed.data.code).digest("hex")

    const { data: codeRow, error: codeErr } = await supabase
      .from("captain_codes")
      .select("*, captain_seats(id, seat_label, captain_name, draft_session_id)")
      .eq("code_hash", codeHash)
      .maybeSingle()

    if (codeErr) throw codeErr

    if (!codeRow) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 })
    }

    if (codeRow.used) {
      return NextResponse.json({ error: "This code has already been used" }, { status: 409 })
    }

    // Check expiry
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 410 })
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

    // Clear rate limit on success
    redeemAttempts.delete(rateKey)

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
