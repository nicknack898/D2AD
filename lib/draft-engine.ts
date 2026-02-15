import { createClient } from "@/lib/supabase-server"

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
  created_at: string
  updated_at: string
}

export interface Lot {
  id: string
  draft_session_id: string
  player_id: string
  lot_order: number
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
  return data
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
  return data
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

// --------------- Bidding ---------------

export async function placeBid(
  lotId: string,
  seatId: string,
  amount: number,
): Promise<Bid> {
  const supabase = await createClient()

  // 1. Verify lot is active
  const { data: lot, error: lotErr } = await supabase
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .maybeSingle()
  if (lotErr) throw lotErr
  if (!lot || lot.status !== "active") {
    throw new Error("LOT_NOT_ACTIVE")
  }

  // 2. Check wallet balance
  const { data: wallet, error: walErr } = await supabase
    .from("wallets")
    .select("*")
    .eq("seat_id", seatId)
    .maybeSingle()
  if (walErr) throw walErr
  if (!wallet || wallet.balance < amount) {
    throw new Error("INSUFFICIENT_FUNDS")
  }

  // 3. Check bid is higher than current highest
  const { data: topBid, error: topErr } = await supabase
    .from("bids")
    .select("amount")
    .eq("lot_id", lotId)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (topErr) throw topErr
  if (topBid && amount <= topBid.amount) {
    throw new Error("BID_TOO_LOW")
  }

  // 4. Insert bid
  const { data: bid, error: bidErr } = await supabase
    .from("bids")
    .insert({ lot_id: lotId, seat_id: seatId, amount })
    .select()
    .single()
  if (bidErr) throw bidErr

  return bid
}

// --------------- Close lot ---------------

export async function closeLot(lotId: string): Promise<{ winning_seat_id: string | null; winning_price: number | null }> {
  const supabase = await createClient()

  // Get top bid
  const { data: topBid, error: topErr } = await supabase
    .from("bids")
    .select("seat_id, amount")
    .eq("lot_id", lotId)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (topErr) throw topErr

  const now = new Date().toISOString()
  const winningSeatId = topBid?.seat_id ?? null
  const winningPrice = topBid?.amount ?? null
  const status = winningSeatId ? "sold" : "unsold"

  // Update lot
  const { error: lotUpErr } = await supabase
    .from("lots")
    .update({
      status,
      winning_seat_id: winningSeatId,
      winning_price: winningPrice,
      closed_at: now,
    })
    .eq("id", lotId)
  if (lotUpErr) throw lotUpErr

  // Deduct from wallet if sold
  if (winningSeatId && winningPrice) {
    const { data: wallet, error: walErr } = await supabase
      .from("wallets")
      .select("balance")
      .eq("seat_id", winningSeatId)
      .single()
    if (walErr) throw walErr

    const { error: deductErr } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - winningPrice })
      .eq("seat_id", winningSeatId)
    if (deductErr) throw deductErr
  }

  return { winning_seat_id: winningSeatId, winning_price: winningPrice }
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
