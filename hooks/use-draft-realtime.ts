"use client"

import { useEffect, useCallback, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import type { RealtimeChannel } from "@supabase/supabase-js"
import useSWR from "swr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface DraftSeat {
  id: string
  seat_label: string
  captain_name: string
  budget: number
  balance: number
}

export interface DraftLotPlayer {
  display_name: string
  discord_id: string | null
  rating: number | null
}

export interface DraftLot {
  id: string
  draft_session_id: string
  player_id: string
  lot_order: number
  phase: "phase1" | "resale" | "phase2"
  min_bid: number
  status: "upcoming" | "active" | "sold" | "unsold"
  winning_seat_id: string | null
  winning_price: number | null
  opened_at: string | null
  closed_at: string | null
  player: DraftLotPlayer
}

export interface DraftState {
  session: {
    id: string
    event_id: string
    phase: "lobby" | "picking" | "paused" | "finished"
    current_lot_id: string | null
    seconds_per_lot: number
  }
  rules: {
    phase1: { selection: { mode: "top_n" | "percentage"; top_n?: number; percentage?: number }; min_bid_pct: number }
    resale: { enabled: boolean; max_lots: number; min_bid_pct_of_winning: number }
    phase2: { min_bid: number }
    rating: { baseline: number; base_value: number; points_per_rating: number; round_to: number }
  }
  phase_metadata: {
    session_phase: string
    resale_enabled: boolean
  }
  lots: DraftLot[]
  seats: DraftSeat[]
}

/**
 * Hook that fetches draft state via SWR and subscribes to Supabase Realtime
 * for live updates on lots and bids tables.
 */
export function useDraftRealtime(sessionId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  const { data, error, isLoading, mutate } = useSWR<DraftState>(
    sessionId ? `/api/draft/${sessionId}` : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false },
  )

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  useEffect(() => {
    if (!sessionId || !supabaseUrl || !supabaseAnonKey) return

    const client = createClient(supabaseUrl, supabaseAnonKey)

    // Collect seat IDs from the current state so we can scope the
    // wallets subscription to only this draft's captains.
    const seatIds = (data?.seats ?? []).map((s) => s.id)

    const channel = client
      .channel(`draft-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots", filter: `draft_session_id=eq.${sessionId}` },
        () => { mutate() },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draft_sessions", filter: `id=eq.${sessionId}` },
        () => { mutate() },
      )

    // Subscribe to bids on a per-lot basis only when there is an active lot.
    // This avoids receiving bid events for every lot in the system.
    const activeLotId = data?.session?.current_lot_id
    if (activeLotId) {
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids", filter: `lot_id=eq.${activeLotId}` },
        () => { mutate() },
      )
    }

    // Scope wallets subscription to seats belonging to this draft.
    for (const seatId of seatIds) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets", filter: `seat_id=eq.${seatId}` },
        () => { mutate() },
      )
    }

    channel.subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
    // Re-subscribe when the active lot or seat list changes so filters stay current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mutate, data?.session?.current_lot_id, data?.seats?.length])

  const activeLot = data?.lots?.find((l) => l.status === "active") ?? null
  const completedLots = data?.lots?.filter((l) => l.status === "sold" || l.status === "unsold") ?? []
  const upcomingLots = data?.lots?.filter((l) => l.status === "upcoming") ?? []

  return {
    state: data ?? null,
    activeLot,
    completedLots,
    upcomingLots,
    error,
    isLoading,
    refresh,
  }
}
