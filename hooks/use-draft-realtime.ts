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
}

export interface DraftLot {
  id: string
  draft_session_id: string
  player_id: string
  lot_order: number
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

    const channel = client
      .channel(`draft-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots", filter: `draft_session_id=eq.${sessionId}` },
        () => { mutate() },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        () => { mutate() },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draft_sessions", filter: `id=eq.${sessionId}` },
        () => { mutate() },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets" },
        () => { mutate() },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [sessionId, mutate])

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
