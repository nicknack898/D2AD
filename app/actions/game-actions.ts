"use server"

import { revalidatePath } from "next/cache"
import { getUpcomingGames, getGameById, getBookingsByGameId } from "@/lib/supabase"
import { supabaseServer } from "@/lib/supabase-server"
import { bookingInputSchema } from "@/lib/validation"

// Read-only helper – uses anon client under RLS
export async function fetchUpcomingGames() {
  try {
    return await getUpcomingGames()
  } catch (error) {
    console.error("Error in fetchUpcomingGames:", error)
    return []
  }
}

export async function fetchGameDetails(gameId: string) {
  try {
    const game = await getGameById(gameId)
    const bookings = await getBookingsByGameId(gameId)

    if (!game) {
      return { game: null, bookings: [], spotsAvailable: 0 }
    }

    const spotsAvailable = Math.max(0, game.max_players - bookings.length)
    return { game, bookings, spotsAvailable }
  } catch (error) {
    console.error("Error in fetchGameDetails:", error)
    return { game: null, bookings: [], spotsAvailable: 0 }
  }
}

/**
 * Safer booking flow with validation and basic capacity checks.
 * NOTE: This reduces but does not eliminate race conditions under high concurrency.
 * For full correctness, run the SQL script in /scripts to create an atomic booking function.
 */
export async function bookGameSlot(
  gameId: string,
  playerData: { name: string; email: string; phone: string },
) {
  try {
    // Validate inputs
    const parsed = bookingInputSchema.safeParse({ gameId, ...playerData })
    if (!parsed.success) {
      return { success: false, message: "Invalid input", issues: parsed.error.flatten() }
    }

    if (!supabaseServer) {
      return { success: false, message: "Database connection unavailable. Please try again later." }
    }

    // Load game to check max capacity
    const { data: game, error: gameErr } = await supabaseServer
      .from("games")
      .select("*")
      .eq("id", gameId)
      .maybeSingle()

    if (gameErr || !game) {
      console.error("bookGameSlot: game error", gameErr)
      return { success: false, message: "Game not found" }
    }

    // Count current bookings quickly
    const { count, error: countErr } = await supabaseServer
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId)

    if (countErr) {
      console.error("bookGameSlot: count error", countErr)
      return { success: false, message: "Could not verify availability" }
    }

    if ((count ?? 0) >= game.max_players) {
      return { success: false, message: "This game is full" }
    }

    // Upsert player by email to avoid duplicates
    const { data: upsertedPlayer, error: upsertErr } = await supabaseServer
      .from("players")
      .upsert(
        {
          name: playerData.name,
          email: playerData.email,
          phone: playerData.phone,
          is_member: true,
        },
        { onConflict: "email" },
      )
      .select()
      .maybeSingle()

    if (upsertErr || !upsertedPlayer) {
      console.error("bookGameSlot: upsert player error", upsertErr)
      return { success: false, message: "Failed to save player" }
    }

    // Prevent duplicate booking for same player & game
    const { data: existingBooking, error: existingErr } = await supabaseServer
      .from("bookings")
      .select("id")
      .eq("game_id", gameId)
      .eq("player_id", upsertedPlayer.id)
      .maybeSingle()

    if (existingErr) {
      console.error("bookGameSlot: existing check error", existingErr)
      return { success: false, message: "Could not verify existing booking" }
    }

    if (existingBooking) {
      return { success: true, message: "You are already booked for this game." }
    }

    // Insert booking
    const { error: bookingErr } = await supabaseServer.from("bookings").insert({
      game_id: gameId,
      player_id: upsertedPlayer.id,
      payment_status: "pending",
      attendance: false,
    })

    if (bookingErr) {
      console.error("bookGameSlot: insert booking error", bookingErr)
      return { success: false, message: "Failed to book game slot" }
    }

    // Update game status if now full (re-check count)
    const { count: afterCount } = await supabaseServer
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId)

    if (typeof afterCount === "number" && afterCount >= game.max_players) {
      await supabaseServer.from("games").update({ status: "full" }).eq("id", gameId)
    }

    revalidatePath("/games")
    revalidatePath(`/games/${gameId}`)

    return { success: true, message: "Game slot booked successfully!" }
  } catch (error) {
    console.error("Error in bookGameSlot:", error)
    return { success: false, message: "An unexpected error occurred. Please try again later." }
  }
}
