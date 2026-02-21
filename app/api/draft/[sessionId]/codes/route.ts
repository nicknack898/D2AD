import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { requireAdminApi } from "@/lib/auth"
import crypto from "crypto"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex")
}

function expiresAt(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function createCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase()
}

/**
 * POST /api/draft/[sessionId]/codes
 * Admin actions: generate, regenerate, revoke, delete a captain code.
 */
export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } },
) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied
    const { sessionId } = params
    if (!UUID_RE.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    const json = await req.json().catch(() => null)
    if (!json || !json._action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = await createClient()
    const { _action, seat_label } = json

    if (_action === "generate_all") {
      const { data: seats, error: sErr } = await supabase
        .from("captain_seats")
        .select("id, seat_label")
        .eq("draft_session_id", sessionId)
        .order("seat_label", { ascending: true })

      if (sErr) throw sErr
      if (!seats || seats.length === 0) {
        return NextResponse.json({ error: "No seats found for this session" }, { status: 404 })
      }

      let generated = 0
      for (const s of seats) {
        const existingCodes = (s as any).captain_codes ?? []
        if (existingCodes.length === 0) {
          const newCode = crypto.randomBytes(4).toString("hex").toUpperCase()
          const insertPayload = {
            seat_id: s.id,
            code: newCode,
            code_hash: hashCode(newCode),
            used: false,
            expires_at: expiresAt(),
          }
          const { error: insertErr } = await supabase
            .from("captain_codes")
            .insert(insertPayload)
          if (insertErr) {
            console.error("captain_codes insert failed:", insertErr.message)
            return NextResponse.json({
              error: `Failed to generate code for ${s.seat_label}: ${insertErr.message}`,
              details: insertErr.details,
            }, { status: 500 })
          }
          generated++
        }

        generatedCodes.push({ seat_label: seat.seat_label, code: newCode })
      }

      return NextResponse.json({
        success: true,
        generated: generatedCodes.length,
        generated_codes: generatedCodes,
        message: `Generated ${generatedCodes.length} new code(s)`,
      })
    }

    if (!seat_label) {
      return NextResponse.json({ error: "seat_label is required" }, { status: 400 })
    }

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
      const newCode = createCode()

      await supabase
        .from("captain_codes")
        .delete()
        .eq("seat_id", seat.id)

      const regenPayload = {
        seat_id: seat.id,
        code: newCode,
        code_hash: hashCode(newCode),
        used: false,
        used_at: null,
        expires_at: expiresAt(),
      }
      const { error: insertErr } = await supabase
        .from("captain_codes")
        .insert(regenPayload)

      if (insertErr) {
        console.error("regenerate insert failed:", insertErr.message)
        return NextResponse.json({
          error: `Failed to regenerate code: ${insertErr.message}`,
          details: insertErr.details,
        }, { status: 500 })
      }

      return NextResponse.json({ success: true, new_code: newCode })
    }

    if (_action === "revoke") {
      const { error: updateErr } = await supabase
        .from("captain_codes")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("seat_id", seat.id)
        .eq("used", false)

      if (updateErr) throw updateErr
      return NextResponse.json({ success: true, message: "Code revoked" })
    }

    if (_action === "delete") {
      const { error: deleteErr } = await supabase
        .from("captain_codes")
        .delete()
        .eq("seat_id", seat.id)

      if (deleteErr) throw deleteErr
      return NextResponse.json({ success: true, message: "Code deleted" })
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
  { params }: { params: { sessionId: string } },
) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied
    const { sessionId } = params
    if (!UUID_RE.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    const supabase = await createClient()

    // Query seats first, then join codes (reliable approach)
    const { data: seats, error: sErr } = await supabase
      .from("captain_seats")
      .select("id, seat_label, captain_name")
      .eq("draft_session_id", sessionId)
      .order("seat_label", { ascending: true })

    if (sErr) throw sErr

    const seatIds = (seats ?? []).map((s) => s.id)
    let codeBySeatId = new Map<string, { code: string | null; used: boolean }>()

    if (seatIds.length > 0) {
      const { data: codes, error: cErr } = await supabase
        .from("captain_codes")
        .select("seat_id, code, used")
        .in("seat_id", seatIds)

      if (cErr) throw cErr

      codeBySeatId = new Map(
        (codes ?? []).map((c) => [c.seat_id, { code: c.code ? normalizeCode(c.code) : null, used: !!c.used }]),
      )
    }

    const seatCodes = (seats ?? []).map((s) => {
      const codeRecord = codeBySeatId.get(s.id)
      return {
        seat_id: s.id,
        seat_label: s.seat_label,
        captain_name: s.captain_name,
        code: codeRecord?.code ?? null,
        used: codeRecord?.used ?? false,
        has_code: !!codeRecord?.code,
      }
    })

    return NextResponse.json({ codes: seatCodes })
  } catch (err) {
    console.error("Codes fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
