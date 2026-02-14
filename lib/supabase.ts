import { createClient } from "@supabase/supabase-js"

// Client intended for safe reads from the public schema with RLS.
// Keep this for non-privileged operations or read-only helpers.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase public environment variables are missing.")
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export type Game = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  court_number: number
  max_players: number
  price: number
  status: "open" | "full" | "closed" | "completed"
  tags: string | null
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  game_id: string
  player_id: string
  payment_status: "pending" | "paid"
  attendance: boolean
  created_at: string
}

export type Player = {
  id: string
  name: string
  email: string
  phone: string
  is_member: boolean
  created_at: string
}

// Helper functions for data fetching (no demo/fallback data)
export async function getUpcomingGames(): Promise<Game[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Supabase error fetching games:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getUpcomingGames:", error)
    return []
  }
}

export async function getGameById(id: string): Promise<Game | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from("games").select("*").eq("id", id).maybeSingle()
    if (error) {
      console.error("Error fetching game:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Error in getGameById:", error)
    return null
  }
}

export async function getBookingsByGameId(gameId: string) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        players (*)
      `,
      )
      .eq("game_id", gameId)

    if (error) {
      console.error("Error fetching bookings:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getBookingsByGameId:", error)
    return []
  }
}

export function parseTags(tagsString: string | null): string[] {
  if (!tagsString) return []
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}
