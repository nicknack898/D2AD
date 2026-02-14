import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { playerRegistrationSchema } from "@/lib/validation"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // First get the event by slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, status")
      .eq("slug", slug)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("players")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data, event: { id: event.id, name: event.name } })
  } catch (err) {
    console.error("Get players error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("slug", slug)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Admin action: update player status
    if (json._action === "update_status") {
      const { player_id, status: newStatus } = json
      if (!player_id || !["confirmed", "pending", "dropped"].includes(newStatus)) {
        return NextResponse.json({ error: "Invalid action payload" }, { status: 400 })
      }
      const { error: updateErr } = await supabase
        .from("players")
        .update({ status: newStatus })
        .eq("id", player_id)
        .eq("event_id", event.id)
      if (updateErr) throw updateErr
      return NextResponse.json({ success: true, message: `Player status updated to ${newStatus}` })
    }

    if (event.status !== "registration_open") {
      return NextResponse.json(
        { success: false, message: "Registration is not currently open for this event" },
        { status: 403 },
      )
    }

    // Override event_id from URL
    const parsed = playerRegistrationSchema.safeParse({ ...json, event_id: event.id })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
        { status: 422 },
      )
    }

    const { data, error } = await supabase.from("players").insert(parsed.data).select().single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, message: "This Discord username is already registered for this event" },
          { status: 409 },
        )
      }
      throw error
    }

    return NextResponse.json(
      { success: true, data, message: "Registration successful! You will be contacted via Discord." },
      { status: 201 },
    )
  } catch (err) {
    console.error("Player registration error:", err)
    return NextResponse.json({ success: false, message: "Failed to register player" }, { status: 500 })
  }
}
