import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { eventSchema } from "@/lib/validation"
import { requireAdminApi } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true, nullsFirst: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    // Fetch player counts for each event
    const eventsWithCounts = await Promise.all(
      (data ?? []).map(async (event: any) => {
        const { count } = await supabase
          .from("players")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "confirmed")
        return { ...event, player_count: count ?? 0 }
      })
    )

    return NextResponse.json({ success: true, data: eventsWithCounts })
  } catch (err) {
    console.error("Get events error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdminApi()
    if (denied) return denied

    const supabase = await createClient()
    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = eventSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
        { status: 422 },
      )
    }

    const { data, error } = await supabase.from("events").insert(parsed.data).select().single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: false, message: "An event with this slug already exists" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error("Create event error:", err)
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 })
  }
}
