import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { createDraftSchema } from "@/lib/validation"
import crypto from "crypto"

/**
 * POST /api/draft
 * Admin-only: creates a draft session from an event's confirmed players.
 * Auto-generates captain seats, wallets, codes, and a lot for every confirmed player.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = createDraftSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { event_id, seconds_per_lot, captain_count, budget_per_captain } = parsed.data
    const supabase = await createClient()

    // Verify event exists
    const { data: event, error: evErr } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", event_id)
      .maybeSingle()
    if (evErr) throw evErr
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Create draft session
    const { data: session, error: sessErr } = await supabase
      .from("draft_sessions")
      .insert({ event_id, seconds_per_lot, phase: "lobby" })
      .select()
      .single()
    if (sessErr) throw sessErr

    // Create captain seats + wallets + codes
    const seats = []
    const codes = []
    for (let i = 0; i < captain_count; i++) {
      const label = `Captain ${String.fromCharCode(65 + i)}` // A, B, C...
      const { data: seat, error: seatErr } = await supabase
        .from("captain_seats")
        .insert({
          draft_session_id: session.id,
          seat_label: label,
          captain_name: label,
          budget: budget_per_captain,
        })
        .select()
        .single()
      if (seatErr) throw seatErr
      seats.push(seat)

      // Create wallet
      const { error: walErr } = await supabase
        .from("wallets")
        .insert({ seat_id: seat.id, balance: budget_per_captain, starting_budget: budget_per_captain, remaining_budget: budget_per_captain })
      if (walErr) throw walErr

      // Generate unique code
      const code = crypto.randomBytes(4).toString("hex").toUpperCase()
      const codeHash = crypto.createHash("sha256").update(code).digest("hex")
      const { error: codeErr } = await supabase
        .from("captain_codes")
        .insert({ seat_id: seat.id, code, code_hash: codeHash, used: false })
      if (codeErr) throw codeErr
      codes.push({ seat_label: label, code })
    }

    // Create lots from confirmed players (shuffled)
    const { data: players, error: plErr } = await supabase
      .from("players")
      .select("id")
      .eq("event_id", event_id)
      .eq("status", "confirmed")
    if (plErr) throw plErr

    const shuffled = (players ?? []).sort(() => Math.random() - 0.5)

    for (let i = 0; i < shuffled.length; i++) {
      const { error: lotErr } = await supabase.from("lots").insert({
        draft_session_id: session.id,
        player_id: shuffled[i].id,
        lot_order: i + 1,
        status: "upcoming",
      })
      if (lotErr) throw lotErr
    }

    return NextResponse.json({
      success: true,
      session,
      seats: seats.map((s) => ({ id: s.id, seat_label: s.seat_label })),
      codes,
      lot_count: shuffled.length,
    })
  } catch (err) {
    console.error("Create draft error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
