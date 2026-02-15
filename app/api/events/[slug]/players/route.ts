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
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", player_id)
        .eq("event_id", event.id)
      if (updateErr) throw updateErr
      return NextResponse.json({ success: true, message: `Player status updated to ${newStatus}` })
    }

    // Admin action: update player details (rating, notes)
    if (json._action === "update_player") {
      const { player_id, rating, notes } = json
      if (!player_id) {
        return NextResponse.json({ error: "player_id required" }, { status: 400 })
      }
      const updates: Record<string, any> = { updated_at: new Date().toISOString() }
      if (rating !== undefined) updates.rating = typeof rating === "number" ? rating : null
      if (notes !== undefined) updates.notes = notes
      const { error: updateErr } = await supabase
        .from("players")
        .update(updates)
        .eq("id", player_id)
        .eq("event_id", event.id)
      if (updateErr) throw updateErr
      return NextResponse.json({ success: true, message: "Player updated" })
    }

    // Admin action: remove player from pool
    if (json._action === "remove_player") {
      const { player_id } = json
      if (!player_id) {
        return NextResponse.json({ error: "player_id required" }, { status: 400 })
      }
      const { error: delErr } = await supabase
        .from("players")
        .delete()
        .eq("id", player_id)
        .eq("event_id", event.id)
      if (delErr) throw delErr
      return NextResponse.json({ success: true, message: "Player removed" })
    }

    // Admin action: manually add a single player (bypasses registration open check)
    if (json._action === "add_player") {
      const { display_name, discord_id, steam_id, rating, rating_source, notes, status: playerStatus } = json
      if (!display_name || !discord_id) {
        return NextResponse.json({ error: "display_name and discord_id are required" }, { status: 400 })
      }
      const { data: newPlayer, error: insertErr } = await supabase
        .from("players")
        .insert({
          event_id: event.id,
          display_name: display_name.trim(),
          discord_id: discord_id.trim(),
          steam_id: steam_id?.trim() || null,
          rating: typeof rating === "number" ? rating : (rating ? parseInt(rating, 10) : null),
          rating_source: rating_source || null,
          notes: notes?.trim() || null,
          status: playerStatus || "confirmed",
        })
        .select()
        .single()
      if (insertErr) {
        if (insertErr.code === "23505") {
          return NextResponse.json({ error: "This player is already registered for this event" }, { status: 409 })
        }
        throw insertErr
      }
      return NextResponse.json({ success: true, data: newPlayer, message: "Player added" }, { status: 201 })
    }

    // Admin action: bulk import players via CSV-like array
    if (json._action === "bulk_import") {
      const { players: importPlayers } = json
      if (!Array.isArray(importPlayers) || importPlayers.length === 0) {
        return NextResponse.json({ error: "players array is required" }, { status: 400 })
      }
      if (importPlayers.length > 200) {
        return NextResponse.json({ error: "Maximum 200 players per import" }, { status: 400 })
      }

      const results = { imported: 0, skipped: 0, errors: [] as string[] }

      for (const p of importPlayers) {
        if (!p.display_name || !p.discord_id) {
          results.errors.push(`Missing display_name or discord_id for entry: ${JSON.stringify(p).slice(0, 80)}`)
          results.skipped++
          continue
        }
        const { error: insertErr } = await supabase
          .from("players")
          .insert({
            event_id: event.id,
            display_name: String(p.display_name).trim().slice(0, 50),
            discord_id: String(p.discord_id).trim().slice(0, 50),
            steam_id: p.steam_id ? String(p.steam_id).trim().slice(0, 50) : null,
            rating: p.rating ? parseInt(String(p.rating), 10) || null : null,
            rating_source: p.rating_source || null,
            notes: p.notes ? String(p.notes).trim().slice(0, 500) : null,
            status: p.status || "confirmed",
          })
        if (insertErr) {
          if (insertErr.code === "23505") {
            results.errors.push(`Duplicate: ${p.discord_id}`)
            results.skipped++
          } else {
            results.errors.push(`Error inserting ${p.discord_id}: ${insertErr.message}`)
            results.skipped++
          }
        } else {
          results.imported++
        }
      }

      return NextResponse.json({
        success: true,
        message: `Imported ${results.imported} of ${importPlayers.length} players`,
        ...results,
      })
    }

    if (event.status !== "registration_open") {
      return NextResponse.json(
        { success: false, message: "Registration is not currently open for this event" },
        { status: 403 },
      )
    }

    // Override event_id from URL, pass through rating_source
    const parsed = playerRegistrationSchema.safeParse({
      ...json,
      event_id: event.id,
      rating_source: json.rating_source || null,
    })
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
