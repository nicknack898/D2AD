import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { eventSchema } from "@/lib/validation"
import { requireAdminApi } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    // Also fetch the player count for this event
    const { count } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("event_id", data.id)
      .eq("status", "confirmed")

    return NextResponse.json({ success: true, data: { ...data, player_count: count ?? 0 } })
  } catch (err) {
    console.error("Get event error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied

    const { slug } = params
    const supabase = await createClient()
    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = eventSchema.partial().safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
        { status: 422 },
      )
    }

    const { data, error } = await supabase
      .from("events")
      .update(parsed.data)
      .eq("slug", slug)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, message: "Event not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Update event error:", err)
    return NextResponse.json({ success: false, message: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied

    const { slug } = params
    const supabase = await createClient()

    const { error } = await supabase.from("events").delete().eq("slug", slug)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Event deleted" })
  } catch (err) {
    console.error("Delete event error:", err)
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 })
  }
}
