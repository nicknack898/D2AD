import { createClient } from "@/lib/supabase-server"
import { parseDraftConfig } from "@/lib/draft-config"
import type { DraftConfigInput } from "@/lib/validation"

/**
 * Draft Engine – server-side helpers for advancing the auction draft.
 * All writes go through the Supabase service-role client.
 */

// --------------- Types ---------------

export type DraftPhase = "lobby" | "picking" | "paused" | "finished"

export interface DraftSession {
  id: string
  event_id: string
  phase: DraftPhase
  current_lot_id: string | null
  seconds_per_lot: number
  config_json: DraftConfigInput
  created_at: string
  updated_at: string
}

export interface Lot {
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
}

export interface Bid {
  id: string
  lot_id: string
  seat_id: string
  amount: number
  created_at: string
}

export interface CaptainSeat {
  id: string
  draft_session_id: string
  seat_label: string
  captain_name: string
  budget: number
}

export interface Wallet {
  id: string
  seat_id: string
  balance: number
  updated_at: string
}

// --------------- Session helpers ---------------

export async function getDraftSession(sessionId: string): Promise<DraftSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("draft_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    ...data,
    config_json: parseDraftConfig(data.config_json),
  }
}

export async function getDraftSessionByEvent(eventId: string): Promise<DraftSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("draft_sessions")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    ...data,
    config_json: parseDraftConfig(data.config_json),
  }
}

export async function setPhase(sessionId: string, phase: DraftPhase) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("draft_sessions")
    .update({ phase })
    .eq("id", sessionId)
  if (error) throw error
}

// --------------- Lot helpers ---------------

export async function getLotsForSession(sessionId: string): Promise<Lot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("draft_session_id", sessionId)
    .order("lot_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getActiveLot(sessionId: string): Promise<Lot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("draft_session_id", sessionId)
    .eq("status", "active")
    .maybeSingle()
  if (error) throw error
  return data
}

export async function openNextLot(sessionId: string): Promise<Lot | null> {
  const supabase = await createClient()

  // Find the first upcoming lot
  const { data: nextLot, error: fetchErr } = await supabase
    .from("lots")
    .select("*")
    .eq("draft_session_id", sessionId)
    .eq("status", "upcoming")
    .order("lot_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fetchErr) throw fetchErr
  if (!nextLot) return null // no more lots

  // Mark it active
  const now = new Date().toISOString()
  const { error: updateErr } = await supabase
    .from("lots")
    .update({ status: "active", opened_at: now })
    .eq("id", nextLot.id)
  if (updateErr) throw updateErr

  // Point session to this lot
  const { error: sessErr } = await supabase
    .from("draft_sessions")
    .update({ current_lot_id: nextLot.id, phase: "picking" })
    .eq("id", sessionId)
  if (sessErr) throw sessErr

  return { ...nextLot, status: "active", opened_at: now }
}

// --------------- Bidding (atomic via RPC) ---------------

export async function placeBid(
  lotId: string,
  seatId: string,
  amount: number,
): Promise<Bid> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("place_bid_atomic", {
    p_lot_id: lotId,
    p_seat_id: seatId,
    p_amount: amount,
  })

  if (error) {
    // The RPC raises exceptions that Supabase returns as error.message
    const msg = error.message ?? ""
    if (msg.includes("LOT_NOT_ACTIVE")) throw new Error("LOT_NOT_ACTIVE")
    if (msg.includes("INSUFFICIENT_FUNDS")) throw new Error("INSUFFICIENT_FUNDS")
    if (msg.includes("BID_TOO_LOW")) throw new Error("BID_TOO_LOW")
    throw error
  }

  return data as Bid
}

// --------------- Close lot (atomic via RPC) ---------------

export async function closeLot(lotId: string): Promise<{ winning_seat_id: string | null; winning_price: number | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("close_lot_atomic", {
    p_lot_id: lotId,
  })

  if (error) {
    const msg = error.message ?? ""
    if (msg.includes("LOT_NOT_FOUND")) throw new Error("LOT_NOT_FOUND")
    if (msg.includes("LOT_NOT_ACTIVE")) throw new Error("LOT_NOT_ACTIVE")
    if (msg.includes("INSUFFICIENT_FUNDS")) throw new Error("INSUFFICIENT_FUNDS")
    throw error
  }

  return {
    winning_seat_id: data?.winning_seat_id ?? null,
    winning_price: data?.winning_price ?? null,
  }
}

// --------------- Seats & Wallets ---------------

export async function getSeatsForSession(sessionId: string): Promise<(CaptainSeat & { wallet: Wallet | null })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("captain_seats")
    .select("*, wallets(*)")
    .eq("draft_session_id", sessionId)
    .order("seat_label", { ascending: true })
  if (error) throw error
  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    wallet: Array.isArray(s.wallets) ? s.wallets[0] ?? null : s.wallets ?? null,
  })) as (CaptainSeat & { wallet: Wallet | null })[]
}

export async function getBidsForLot(lotId: string): Promise<Bid[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("lot_id", lotId)
    .order("amount", { ascending: false })
  if (error) throw error
  return data ?? []
}
