import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { sql } from "@/lib/db"
import { teamRegistrationSchema } from "@/lib/validation"

type RegistrationPayload = z.infer<typeof teamRegistrationSchema>

type TeamIdRow = { id: number }
type SteamIdRow = { steam_id: string }
type CountRow = { count: string }
type TeamWithMembersRow = {
  id: number
  team_name: string
  contact_email: string
  contact_discord: string | null
  contact_steam: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  members: Array<{
    id: number
    player_name: string
    steam_id: string
    is_captain: boolean
  }>
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = teamRegistrationSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        { status: 422 },
      )
    }

    const payload: RegistrationPayload = parsed.data

    const existingTeam = (await sql`
      SELECT id FROM team_registrations
      WHERE LOWER(team_name) = LOWER(${payload.teamName})
    `) as TeamIdRow[]

    if (existingTeam.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name already registered. Please choose a different name.",
        },
        { status: 409 },
      )
    }

    const steamIds = payload.members.map((m) => m.steamId)
    const uniqueSteamIds = new Set(steamIds)
    if (steamIds.length !== uniqueSteamIds.size) {
      return NextResponse.json(
        {
          success: false,
          message: "Each player must have a unique Steam ID.",
        },
        { status: 422 },
      )
    }

    const existingSteamIds = (await sql`
      SELECT DISTINCT steam_id FROM team_members
      WHERE steam_id = ANY(${steamIds})
    `) as SteamIdRow[]

    if (existingSteamIds.length > 0) {
      const duplicateIds = existingSteamIds.map((row) => row.steam_id)
      return NextResponse.json(
        {
          success: false,
          message: `The following Steam IDs are already registered: ${duplicateIds.join(", ")}`,
        },
        { status: 409 },
      )
    }

    const teamResult = (await sql`
      INSERT INTO team_registrations (
        team_name,
        contact_email,
        contact_discord,
        contact_steam,
        notes
      ) VALUES (
        ${payload.teamName},
        ${payload.contact.email},
        ${payload.contact.discord || null},
        ${payload.contact.steam || null},
        ${payload.notes || null}
      ) RETURNING id
    `) as TeamIdRow[]

    const teamId = teamResult[0]?.id

    for (const member of payload.members) {
      await sql`
        INSERT INTO team_members (
          team_id,
          player_name,
          steam_id,
          is_captain
        ) VALUES (
          ${teamId},
          ${member.name},
          ${member.steamId},
          ${member.isCaptain || false}
        )
      `
    }

    return NextResponse.json(
      {
        success: true,
        teamId,
        message: "Team registered successfully! You will receive confirmation via Discord.",
      },
      { status: 201 },
    )
  } catch (err) {
    console.error("Registration error:", err)

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration data",
          errors: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 422 },
      )
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Math.max(Number.parseInt(searchParams.get("offset") || "0"), 0)
    const status = searchParams.get("status") || "all"

    const teams = (status === "all"
      ? await sql`
          SELECT
            tr.*,
            json_agg(
              json_build_object(
                'id', tm.id,
                'player_name', tm.player_name,
                'steam_id', tm.steam_id,
                'is_captain', tm.is_captain
              ) ORDER BY tm.is_captain DESC, tm.id
            ) as members
          FROM team_registrations tr
          LEFT JOIN team_members tm ON tr.id = tm.team_id
          GROUP BY tr.id
          ORDER BY tr.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql`
          SELECT
            tr.*,
            json_agg(
              json_build_object(
                'id', tm.id,
                'player_name', tm.player_name,
                'steam_id', tm.steam_id,
                'is_captain', tm.is_captain
              ) ORDER BY tm.is_captain DESC, tm.id
            ) as members
          FROM team_registrations tr
          LEFT JOIN team_members tm ON tr.id = tm.team_id
          WHERE tr.status = ${status}
          GROUP BY tr.id
          ORDER BY tr.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `) as TeamWithMembersRow[]

    const totalCount = (status === "all"
      ? await sql`SELECT COUNT(*) as count FROM team_registrations`
      : await sql`SELECT COUNT(*) as count FROM team_registrations WHERE status = ${status}`) as CountRow[]

    const total = Number.parseInt(totalCount[0]?.count ?? "0", 10)

    return NextResponse.json({
      success: true,
      data: teams,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (err) {
    console.error("Get registrations error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch registrations" }, { status: 500 })
  }
}
