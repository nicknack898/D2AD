"use client"

import { useState, useCallback, useEffect } from "react"
import { useDraftRealtime, type DraftSeat, type DraftLot } from "@/hooks/use-draft-realtime"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Gavel,
  Users,
  Clock,
  Trophy,
  Loader2,
  Wifi,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Wallet,
  LogOut,
  X,
} from "lucide-react"

// ---------- Types ----------

interface CaptainSeatInfo {
  id: string
  seat_label: string
  captain_name: string
}

// ---------- Main Component ----------

export function DraftRoomClient({ sessionId }: { sessionId: string }) {
  const { state, activeLot, completedLots, upcomingLots, isLoading, error, refresh } =
    useDraftRealtime(sessionId)
  const [captainSeat, setCaptainSeat] = useState<CaptainSeatInfo | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if already authenticated via cookie
  useEffect(() => {
    fetch(`/api/draft/${sessionId}/auth`)
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.seat) {
          setCaptainSeat(data.seat)
        }
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [sessionId])

  const handleLogout = useCallback(() => {
    // Clear the captain_token cookie via a logout approach
    document.cookie = "captain_token=; path=/; max-age=0"
    setCaptainSeat(null)
    setShowLogin(false)
  }, [])

  if (isLoading || !state || !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Draft Room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load draft session</p>
          <p className="text-muted-foreground/60 text-sm">Check the session ID and try again.</p>
        </div>
      </div>
    )
  }

  const { session, seats } = state
  const phase = session.phase
  const isCaptain = !!captainSeat
  const mySeat = isCaptain ? seats.find((s) => s.id === captainSeat.id) : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Bar */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gavel className="h-5 w-5 text-blue-400" />
            <h1 className="font-bebas text-2xl tracking-wide">D2AD Draft Room</h1>
          </div>
          <div className="flex items-center gap-4">
            <PhaseIndicator phase={phase} />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              <span>Live</span>
            </div>
            {isCaptain ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-none px-3 py-1.5">
                  <Gavel className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">{captainSeat.captain_name}</span>
                  {mySeat && (
                    <span className="text-sm font-mono text-green-400 ml-1">{mySeat.balance}</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground/60 hover:text-foreground/80 transition-colors"
                  title="Log out as captain"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 h-8 text-xs"
                onClick={() => setShowLogin(true)}
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                Captain Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Captain Login Modal Overlay */}
      {showLogin && !isCaptain && (
        <CaptainLoginOverlay
          sessionId={sessionId}
          onSuccess={(seat) => {
            setCaptainSeat(seat)
            setShowLogin(false)
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Captain Bidding Panel (shown when authenticated and lot is active) */}
        {isCaptain && (phase === "picking" || phase === "paused") && activeLot && (
          <CaptainBidPanel
            sessionId={sessionId}
            seat={captainSeat}
            activeLot={activeLot}
            balance={mySeat?.balance ?? 0}
            isPaused={phase === "paused"}
            onBidPlaced={refresh}
          />
        )}

        {/* Captain: Lobby status */}
        {isCaptain && phase === "lobby" && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-none p-5 flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-400 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                You are logged in as {captainSeat.captain_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Waiting for the admin to start the draft. Your bidding panel will appear when the first lot opens.
              </p>
            </div>
          </div>
        )}

        {/* Phase: Lobby (spectator info) */}
        {phase === "lobby" && !isCaptain && (
          <div className="bg-card/50 border border-border rounded-none p-8 text-center">
            <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="font-bebas text-3xl tracking-wide mb-2">Waiting to Begin</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The draft has not started yet. Captains are joining and the admin will start the
              auction shortly.
            </p>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground/60">
                {seats.length} captain seat{seats.length !== 1 ? "s" : ""} configured
                {" / "}
                {(upcomingLots?.length ?? 0) + (completedLots?.length ?? 0)} player
                {(upcomingLots?.length ?? 0) + (completedLots?.length ?? 0) !== 1 ? "s" : ""} in
                the pool
              </p>
            </div>
          </div>
        )}

        {/* Phase: Picking / Paused */}
        {(phase === "picking" || phase === "paused") && (
          <>
            {/* Active Lot */}
            {activeLot ? (
              <ActiveLotCard lot={activeLot} seats={seats} isPaused={phase === "paused"} />
            ) : (
              <div className="bg-card/50 border border-border rounded-none p-6 text-center">
                <p className="text-muted-foreground">Waiting for the next player...</p>
              </div>
            )}

            {/* Captains Row */}
            <div>
              <h3 className="font-teko text-xl tracking-wide text-foreground/80 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Captain Budgets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {seats.map((seat) => (
                  <SeatCard key={seat.id} seat={seat} isMe={seat.id === captainSeat?.id} />
                ))}
              </div>
            </div>

            {/* My Roster (captain only) */}
            {isCaptain && (
              <CaptainRoster
                completedLots={completedLots}
                seatId={captainSeat.id}
              />
            )}

            {/* Results Feed */}
            {completedLots.length > 0 && (
              <div>
                <h3 className="font-teko text-xl tracking-wide text-foreground/80 mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Draft Results
                </h3>
                <ResultsTable lots={completedLots} seats={seats} />
              </div>
            )}

            {/* Upcoming Preview */}
            {upcomingLots.length > 0 && (
              <div>
                <h3 className="font-teko text-xl tracking-wide text-foreground/80 mb-3">
                  Up Next ({upcomingLots.length} remaining)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {upcomingLots.slice(0, 8).map((lot) => (
                    <div
                      key={lot.id}
                      className="bg-card/50 border border-border rounded px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      #{lot.lot_order} {lot.player.display_name}
                    </div>
                  ))}
                  {upcomingLots.length > 8 && (
                    <div className="bg-card/30 rounded px-3 py-1.5 text-sm text-muted-foreground/60">
                      +{upcomingLots.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Phase: Finished */}
        {phase === "finished" && (
          <div className="bg-card/50 border border-border rounded-none p-8 text-center">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-bebas text-3xl tracking-wide mb-2">Draft Complete</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              All players have been drafted. Check the results below.
            </p>

            {/* Final Rosters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left mt-6">
              {seats.map((seat) => {
                const roster = completedLots.filter(
                  (l) => l.status === "sold" && l.winning_seat_id === seat.id,
                )
                return (
                  <div
                    key={seat.id}
                    className={`bg-card border rounded-none p-4 ${
                      seat.id === captainSeat?.id
                        ? "border-blue-500"
                        : "border-border"
                    }`}
                  >
                    <h4 className="font-teko text-lg text-blue-400 mb-2">
                      {seat.captain_name}
                      {seat.id === captainSeat?.id && (
                        <span className="text-xs text-blue-300 ml-2">(You)</span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground/60 mb-3">
                      Budget remaining:{" "}
                      <span className="font-mono text-foreground/80">{seat.balance}</span>
                    </p>
                    {roster.length > 0 ? (
                      <ul className="space-y-1">
                        {roster.map((lot) => (
                          <li key={lot.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{lot.player.display_name}</span>
                            <span className="text-green-400 font-mono text-xs">
                              {lot.winning_price}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground/60 text-sm italic">No players drafted</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ---------- Captain Login Overlay ----------

function CaptainLoginOverlay({
  sessionId,
  onSuccess,
  onClose,
}: {
  sessionId: string
  onSuccess: (seat: CaptainSeatInfo) => void
  onClose: () => void
}) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRedeem = useCallback(async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/draft/${sessionId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to redeem code")
        return
      }
      onSuccess(data.seat)
    } catch {
      setError("Network error, please try again")
    } finally {
      setLoading(false)
    }
  }, [code, sessionId, onSuccess])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-none shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-400" />
            <h2 className="font-bebas text-2xl tracking-wide text-foreground">
              Captain Login
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your unique captain code to join the draft as a bidder.
          </p>

          <Input
            placeholder="Enter your code (e.g. A1B2C3D4)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            className="bg-background border-border text-center text-lg font-mono tracking-widest uppercase text-foreground"
            maxLength={20}
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-500/20 rounded-none px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleRedeem}
            disabled={loading || !code.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Redeem Code
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------- Captain Bid Panel ----------

function CaptainBidPanel({
  sessionId,
  seat,
  activeLot,
  balance,
  isPaused,
  onBidPlaced,
}: {
  sessionId: string
  seat: CaptainSeatInfo
  activeLot: DraftLot
  balance: number
  isPaused: boolean
  onBidPlaced: () => void
}) {
  const [bidAmount, setBidAmount] = useState("")
  const [bidLoading, setBidLoading] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState(false)

  const handleBid = useCallback(async () => {
    if (!activeLot || !bidAmount) return
    const amount = parseInt(bidAmount, 10)
    if (isNaN(amount) || amount < 1) return

    setBidLoading(true)
    setBidError(null)
    setBidSuccess(false)

    try {
      const res = await fetch(`/api/draft/${sessionId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lot_id: activeLot.id, amount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBidError(data.error ?? "Bid failed")
        return
      }
      setBidSuccess(true)
      setBidAmount("")
      onBidPlaced()
      setTimeout(() => setBidSuccess(false), 2000)
    } catch {
      setBidError("Network error")
    } finally {
      setBidLoading(false)
    }
  }, [activeLot, bidAmount, sessionId, onBidPlaced])

  return (
    <div className="bg-blue-500/5 border-2 border-blue-500/30 rounded-none p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gavel className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
            Your Bid -- Lot #{activeLot.lot_order}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="font-mono text-green-400 font-semibold">{balance}</span>
          <span className="text-muted-foreground/60">remaining</span>
        </div>
      </div>

      {isPaused ? (
        <div className="text-center py-3">
          <p className="text-yellow-400 text-sm font-medium">Draft is paused -- bidding will resume shortly</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="number"
            placeholder="Enter bid amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBid()}
            className="bg-background border-border font-mono text-lg flex-1 text-foreground"
            min={1}
            max={balance}
          />
          <Button
            onClick={handleBid}
            disabled={bidLoading || !bidAmount}
            className="bg-green-600 hover:bg-green-700 text-foreground px-8"
          >
            {bidLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Gavel className="mr-2 h-4 w-4" />
                Place Bid
              </>
            )}
          </Button>
        </div>
      )}

      {bidError && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{bidError}</span>
        </div>
      )}
      {bidSuccess && (
        <div className="flex items-center gap-2 text-green-400 text-sm mt-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Bid placed successfully!</span>
        </div>
      )}
    </div>
  )
}

// ---------- Captain Roster ----------

function CaptainRoster({
  completedLots,
  seatId,
}: {
  completedLots: DraftLot[]
  seatId: string
}) {
  const myRoster = completedLots.filter((l) => l.status === "sold" && l.winning_seat_id === seatId)

  return (
    <div>
      <h3 className="font-teko text-xl tracking-wide text-foreground/80 mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-400" /> My Roster ({myRoster.length})
      </h3>
      {myRoster.length > 0 ? (
        <div className="bg-card/50 border border-border rounded-none overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">Player</th>
                <th className="text-right px-4 py-2 font-medium">Price Paid</th>
              </tr>
            </thead>
            <tbody>
              {myRoster.map((lot) => (
                <tr key={lot.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 text-foreground">{lot.player.display_name}</td>
                  <td className="px-4 py-2 text-right font-mono text-green-400">
                    {lot.winning_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card/50 border border-border rounded-none p-4 text-center text-muted-foreground/60 text-sm">
          No players drafted yet
        </div>
      )}
    </div>
  )
}

// ---------- Results Table ----------

function ResultsTable({ lots, seats }: { lots: DraftLot[]; seats: DraftSeat[] }) {
  return (
    <div className="bg-card/50 border border-border rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-4 py-2 font-medium">#</th>
              <th className="text-left px-4 py-2 font-medium">Player</th>
              <th className="text-left px-4 py-2 font-medium">Sold To</th>
              <th className="text-right px-4 py-2 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => {
              const winner = seats.find((s) => s.id === lot.winning_seat_id)
              return (
                <tr key={lot.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 text-muted-foreground/60">{lot.lot_order}</td>
                  <td className="px-4 py-2 text-foreground">{lot.player.display_name}</td>
                  <td className="px-4 py-2">
                    {lot.status === "sold" ? (
                      <span className="text-blue-400">{winner?.captain_name ?? "Unknown"}</span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">Unsold</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {lot.winning_price !== null ? (
                      <span className="text-green-400 font-mono">{lot.winning_price}</span>
                    ) : (
                      <span className="text-muted-foreground/60">--</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------- Shared Sub-components ----------

function PhaseIndicator({ phase }: { phase: string }) {
  const config: Record<string, { label: string; color: string }> = {
    lobby: { label: "Lobby", color: "bg-muted-foreground" },
    picking: { label: "Live", color: "bg-green-500 animate-pulse" },
    paused: { label: "Paused", color: "bg-yellow-500" },
    finished: { label: "Finished", color: "bg-blue-500" },
  }
  const c = config[phase] ?? config.lobby
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
      <span className="text-foreground/80">{c.label}</span>
    </div>
  )
}

function ActiveLotCard({
  lot,
  seats,
  isPaused,
}: {
  lot: DraftLot
  seats: DraftSeat[]
  isPaused: boolean
}) {
  return (
    <div
      className={`rounded-none border-2 p-6 ${
        isPaused
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-blue-500/50 bg-blue-500/5"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">
            Lot #{lot.lot_order} {isPaused && "-- PAUSED"}
          </p>
          <h2 className="font-bebas text-4xl tracking-wide text-foreground">
            {lot.player.display_name}
          </h2>
          {lot.player.discord_id && (
            <p className="text-sm text-muted-foreground mt-1">Discord: {lot.player.discord_id}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">Current High Bid</p>
          <p className="font-mono text-3xl text-green-400 font-bold">--</p>
        </div>
      </div>
    </div>
  )
}

function SeatCard({ seat, isMe }: { seat: DraftSeat; isMe?: boolean }) {
  const pct = seat.budget > 0 ? (seat.balance / seat.budget) * 100 : 0
  return (
    <div
      className={`bg-card border rounded-none p-3 ${
        isMe ? "border-blue-500 ring-1 ring-blue-500/20" : "border-border"
      }`}
    >
      <p className="font-teko text-base text-blue-400 truncate">
        {seat.captain_name}
        {isMe && <span className="text-xs text-blue-300 ml-1">(You)</span>}
      </p>
      <p className="font-mono text-lg text-foreground">{seat.balance}</p>
      <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/60 mt-1">{Math.round(pct)}% remaining</p>
    </div>
  )
}
