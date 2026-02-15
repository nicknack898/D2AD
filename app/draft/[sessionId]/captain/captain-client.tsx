"use client"

import { useState, useCallback } from "react"
import { useDraftRealtime, type DraftLot, type DraftSeat } from "@/hooks/use-draft-realtime"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeyRound, Gavel, Loader2, CheckCircle2, AlertCircle, Wallet, Trophy, Users, Lock } from "lucide-react"
import Image from "next/image"

const CAPTAIN_PASSWORD = "1234"

// ---------- Main Component ----------

export function CaptainClient({ sessionId }: { sessionId: string }) {
  const [passwordOk, setPasswordOk] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [seatInfo, setSeatInfo] = useState<{ id: string; seat_label: string; captain_name: string } | null>(null)

  if (!passwordOk) {
    return <CaptainPasswordGate onSuccess={() => setPasswordOk(true)} />
  }

  if (!authed || !seatInfo) {
    return (
      <RedeemCodeView
        sessionId={sessionId}
        onSuccess={(seat) => {
          setSeatInfo(seat)
          setAuthed(true)
        }}
      />
    )
  }

  return <CaptainDashboard sessionId={sessionId} seat={seatInfo} />
}

// ---------- Captain Password Gate ----------

function CaptainPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (password === CAPTAIN_PASSWORD) {
      onSuccess()
    } else {
      setError("Incorrect password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <Image
              src="/ability-draft-logo.png"
              alt="D2AD Logo"
              width={48}
              height={48}
              className="mx-auto mb-4 rounded-lg"
            />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-yellow-400" />
              <h1 className="font-bebas text-2xl tracking-wide text-slate-100">Captain Access</h1>
            </div>
            <p className="text-sm text-slate-400">Enter the captain password to continue.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="captain-pw" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <Input
                id="captain-pw"
                type="password"
                placeholder="Enter captain password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Code Redemption ----------

function RedeemCodeView({
  sessionId,
  onSuccess,
}: {
  sessionId: string
  onSuccess: (seat: { id: string; seat_label: string; captain_name: string }) => void
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <KeyRound className="h-10 w-10 text-blue-400 mx-auto mb-3" />
            <h1 className="font-bebas text-3xl tracking-wide text-slate-100">Captain Login</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your captain code to join the draft</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Enter your code (e.g. A1B2C3D4)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              className="bg-slate-900 border-slate-600 text-center text-lg font-mono tracking-widest uppercase"
              maxLength={20}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleRedeem}
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
    </div>
  )
}

// ---------- Captain Dashboard ----------

function CaptainDashboard({
  sessionId,
  seat,
}: {
  sessionId: string
  seat: { id: string; seat_label: string; captain_name: string }
}) {
  const { state, activeLot, completedLots, isLoading } = useDraftRealtime(sessionId)
  const [bidAmount, setBidAmount] = useState("")
  const [bidLoading, setBidLoading] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState(false)

  const mySeat = state?.seats.find((s) => s.id === seat.id)
  const myRoster = completedLots.filter((l) => l.status === "sold" && l.winning_seat_id === seat.id)

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
      setTimeout(() => setBidSuccess(false), 2000)
    } catch {
      setBidError("Network error")
    } finally {
      setBidLoading(false)
    }
  }, [activeLot, bidAmount, sessionId])

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const phase = state.session.phase

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Captain Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gavel className="h-5 w-5 text-blue-400" />
            <div>
              <h1 className="font-bebas text-xl tracking-wide">Captain Panel</h1>
              <p className="text-xs text-slate-400">{seat.captain_name} -- {seat.seat_label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-400" />
            <span className="font-mono text-lg text-green-400">{mySeat?.balance ?? "--"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Lobby */}
        {phase === "lobby" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
            <h2 className="font-bebas text-2xl tracking-wide mb-2">You are In</h2>
            <p className="text-slate-400">Waiting for the admin to start the draft. Stay on this page.</p>
          </div>
        )}

        {/* Active Bidding */}
        {(phase === "picking" || phase === "paused") && activeLot && (
          <div className={`rounded-lg border-2 p-6 ${phase === "paused" ? "border-yellow-500/50 bg-yellow-500/5" : "border-blue-500/50 bg-blue-500/5"}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Lot #{activeLot.lot_order} {phase === "paused" && "-- PAUSED"}
            </p>
            <h2 className="font-bebas text-3xl tracking-wide text-slate-100 mb-4">
              {activeLot.player.display_name}
            </h2>

            {phase === "picking" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="number"
                  placeholder="Enter bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBid()}
                  className="bg-slate-900 border-slate-600 font-mono text-lg flex-1"
                  min={1}
                  max={mySeat?.balance ?? 0}
                />
                <Button
                  onClick={handleBid}
                  disabled={bidLoading || !bidAmount || phase !== "picking"}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
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
        )}

        {/* My Roster */}
        <div>
          <h3 className="font-teko text-xl tracking-wide text-slate-300 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" /> My Roster ({myRoster.length})
          </h3>
          {myRoster.length > 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-2 font-medium">Player</th>
                    <th className="text-right px-4 py-2 font-medium">Price Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {myRoster.map((lot) => (
                    <tr key={lot.id} className="border-b border-slate-700/50 last:border-0">
                      <td className="px-4 py-2 text-slate-200">{lot.player.display_name}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-400">
                        {lot.winning_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-slate-500 text-sm">
              No players drafted yet
            </div>
          )}
        </div>

        {/* All Captains */}
        <div>
          <h3 className="font-teko text-xl tracking-wide text-slate-300 mb-3">All Captains</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {state.seats.map((s) => (
              <div
                key={s.id}
                className={`bg-slate-800 border rounded-lg p-3 ${s.id === seat.id ? "border-blue-500" : "border-slate-700"}`}
              >
                <p className="font-teko text-base text-slate-300 truncate">{s.captain_name}</p>
                <p className="font-mono text-lg text-slate-100">{s.balance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Finished */}
        {phase === "finished" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h2 className="font-bebas text-2xl tracking-wide mb-2">Draft Complete</h2>
            <p className="text-slate-400">Your roster is final. Good luck!</p>
          </div>
        )}
      </main>
    </div>
  )
}
