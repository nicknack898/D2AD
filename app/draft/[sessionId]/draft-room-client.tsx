"use client"

import { useDraftRealtime, type DraftSeat, type DraftLot } from "@/hooks/use-draft-realtime"
import { Gavel, Users, Clock, Trophy, Loader2, Wifi } from "lucide-react"

// ---------- Main Component ----------

export function DraftRoomClient({ sessionId }: { sessionId: string }) {
  const { state, activeLot, completedLots, upcomingLots, isLoading, error } = useDraftRealtime(sessionId)

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading Draft Room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load draft session</p>
          <p className="text-slate-500 text-sm">Check the session ID and try again.</p>
        </div>
      </div>
    )
  }

  const { session, seats } = state
  const phase = session.phase

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gavel className="h-5 w-5 text-blue-400" />
            <h1 className="font-bebas text-2xl tracking-wide">D2AD Draft Room</h1>
          </div>
          <div className="flex items-center gap-4">
            <PhaseIndicator phase={phase} />
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Phase: Lobby */}
        {phase === "lobby" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="font-bebas text-3xl tracking-wide mb-2">Waiting to Begin</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              The draft has not started yet. Captains are joining and the admin will start the
              auction shortly.
            </p>
            <div className="mt-6">
              <p className="text-sm text-slate-500">
                {seats.length} captain seat{seats.length !== 1 ? "s" : ""} configured
                {" / "}
                {(upcomingLots?.length ?? 0) + (completedLots?.length ?? 0)} player{((upcomingLots?.length ?? 0) + (completedLots?.length ?? 0)) !== 1 ? "s" : ""} in the pool
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
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <p className="text-slate-400">Waiting for the next player...</p>
              </div>
            )}

            {/* Captains Row */}
            <div>
              <h3 className="font-teko text-xl tracking-wide text-slate-300 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Captain Budgets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {seats.map((seat) => (
                  <SeatCard key={seat.id} seat={seat} />
                ))}
              </div>
            </div>

            {/* Results Feed */}
            {completedLots.length > 0 && (
              <div>
                <h3 className="font-teko text-xl tracking-wide text-slate-300 mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Draft Results
                </h3>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="text-left px-4 py-2 font-medium">#</th>
                          <th className="text-left px-4 py-2 font-medium">Player</th>
                          <th className="text-left px-4 py-2 font-medium">Sold To</th>
                          <th className="text-right px-4 py-2 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedLots.map((lot) => {
                          const winner = seats.find((s) => s.id === lot.winning_seat_id)
                          return (
                            <tr key={lot.id} className="border-b border-slate-700/50 last:border-0">
                              <td className="px-4 py-2 text-slate-500">{lot.lot_order}</td>
                              <td className="px-4 py-2 text-slate-200">{lot.player.display_name}</td>
                              <td className="px-4 py-2">
                                {lot.status === "sold" ? (
                                  <span className="text-blue-400">{winner?.captain_name ?? "Unknown"}</span>
                                ) : (
                                  <span className="text-slate-500 italic">Unsold</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {lot.winning_price !== null ? (
                                  <span className="text-green-400 font-mono">{lot.winning_price}</span>
                                ) : (
                                  <span className="text-slate-500">--</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Preview */}
            {upcomingLots.length > 0 && (
              <div>
                <h3 className="font-teko text-xl tracking-wide text-slate-300 mb-3">
                  Up Next ({upcomingLots.length} remaining)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {upcomingLots.slice(0, 8).map((lot) => (
                    <div
                      key={lot.id}
                      className="bg-slate-800/50 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-400"
                    >
                      #{lot.lot_order} {lot.player.display_name}
                    </div>
                  ))}
                  {upcomingLots.length > 8 && (
                    <div className="bg-slate-800/30 rounded px-3 py-1.5 text-sm text-slate-500">
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
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-bebas text-3xl tracking-wide mb-2">Draft Complete</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              All players have been drafted. Check the results below.
            </p>

            {/* Final Rosters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left mt-6">
              {seats.map((seat) => {
                const roster = completedLots.filter(
                  (l) => l.status === "sold" && l.winning_seat_id === seat.id,
                )
                return (
                  <div key={seat.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-teko text-lg text-blue-400 mb-2">{seat.captain_name}</h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Budget remaining: <span className="font-mono text-slate-300">{seat.balance}</span>
                    </p>
                    {roster.length > 0 ? (
                      <ul className="space-y-1">
                        {roster.map((lot) => (
                          <li key={lot.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-200">{lot.player.display_name}</span>
                            <span className="text-green-400 font-mono text-xs">{lot.winning_price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm italic">No players drafted</p>
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

// ---------- Sub-components ----------

function PhaseIndicator({ phase }: { phase: string }) {
  const config: Record<string, { label: string; color: string }> = {
    lobby: { label: "Lobby", color: "bg-slate-500" },
    picking: { label: "Live", color: "bg-green-500 animate-pulse" },
    paused: { label: "Paused", color: "bg-yellow-500" },
    finished: { label: "Finished", color: "bg-blue-500" },
  }
  const c = config[phase] ?? config.lobby
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
      <span className="text-slate-300">{c.label}</span>
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
    <div className={`rounded-lg border-2 p-6 ${isPaused ? "border-yellow-500/50 bg-yellow-500/5" : "border-blue-500/50 bg-blue-500/5"}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Lot #{lot.lot_order} {isPaused && "-- PAUSED"}
          </p>
          <h2 className="font-bebas text-4xl tracking-wide text-slate-100">
            {lot.player.display_name}
          </h2>
          {lot.player.discord_id && (
            <p className="text-sm text-slate-400 mt-1">Discord: {lot.player.discord_id}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current High Bid</p>
          <p className="font-mono text-3xl text-green-400 font-bold">
            {/* will be enriched by bids in future, for now show lot status */}
            --
          </p>
        </div>
      </div>
    </div>
  )
}

function SeatCard({ seat }: { seat: DraftSeat }) {
  const pct = seat.budget > 0 ? (seat.balance / seat.budget) * 100 : 0
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <p className="font-teko text-base text-blue-400 truncate">{seat.captain_name}</p>
      <p className="font-mono text-lg text-slate-100">{seat.balance}</p>
      <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">{Math.round(pct)}% remaining</p>
    </div>
  )
}
