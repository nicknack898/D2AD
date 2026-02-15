"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  KeyRound,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Users,
  Clipboard,
  RotateCcw,
  XCircle,
  Search,
} from "lucide-react"
import Link from "next/link"

interface DraftSession {
  id: string
  event_id: string
  phase: string
  seconds_per_lot: number
  created_at: string
}

interface Event {
  id: string
  name: string
  slug: string
}

interface CodeEntry {
  seat_id: string
  seat_label: string
  captain_name: string
  code: string | null
  used: boolean
  has_code: boolean
}

type SessionCodes = {
  session: DraftSession
  event: Event | null
  codes: CodeEntry[]
  expanded: boolean
  loading: boolean
}

export default function CaptainCodesPage() {
  const [sessionCodes, setSessionCodes] = useState<SessionCodes[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [evRes, sessRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/draft/list"),
      ])
      const evData = await evRes.json()
      const sessData = await sessRes.json()
      const evList: Event[] = evData.data ?? []
      const sessList: DraftSession[] = sessData.data ?? []

      setEvents(evList)
      setSessionCodes(
        sessList.map((s) => ({
          session: s,
          event: evList.find((e) => e.id === s.event_id) ?? null,
          codes: [],
          expanded: false,
          loading: false,
        }))
      )
    } catch {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggleExpand = async (sessionId: string) => {
    setSessionCodes((prev) =>
      prev.map((sc) => {
        if (sc.session.id !== sessionId) return sc
        if (sc.expanded) return { ...sc, expanded: false }
        return { ...sc, expanded: true, loading: true }
      })
    )

    // Fetch codes for this session
    try {
      const res = await fetch(`/api/draft/${sessionId}/codes`)
      const data = await res.json()
      setSessionCodes((prev) =>
        prev.map((sc) =>
          sc.session.id === sessionId
            ? { ...sc, codes: data.codes ?? [], loading: false }
            : sc
        )
      )
    } catch {
      setSessionCodes((prev) =>
        prev.map((sc) =>
          sc.session.id === sessionId
            ? { ...sc, loading: false }
            : sc
        )
      )
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const copyAllCodes = (sc: SessionCodes) => {
    const text = sc.codes
      .filter((c) => c.code)
      .map((c) => `${c.seat_label}: ${c.code}${c.used ? " (Used)" : ""}`)
      .join("\n")
    navigator.clipboard.writeText(text)
    setCopiedCode("__all__" + sc.session.id)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const regenerateCode = async (sessionId: string, seatLabel: string, oldCode: string) => {
    setActionLoading(oldCode)
    try {
      const res = await fetch(`/api/draft/${sessionId}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "regenerate", seat_label: seatLabel }),
      })
      if (res.ok) {
        const data = await res.json()
        setSessionCodes((prev) =>
          prev.map((sc) =>
            sc.session.id === sessionId
              ? {
                  ...sc,
                  codes: sc.codes.map((c) =>
                    c.seat_label === seatLabel ? { ...c, code: data.new_code, used: false } : c
                  ),
                }
              : sc
          )
        )
      } else {
        const data = await res.json()
        setError(data.error ?? "Failed to regenerate code")
      }
    } catch {
      setError("Network error regenerating code")
    } finally {
      setActionLoading(null)
    }
  }

  const revokeCode = async (sessionId: string, seatLabel: string, code: string) => {
    if (!confirm(`Revoke the code for ${seatLabel}? This will prevent the captain from authenticating with this code.`)) return
    setActionLoading(code)
    try {
      const res = await fetch(`/api/draft/${sessionId}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "revoke", seat_label: seatLabel }),
      })
      if (res.ok) {
        setSessionCodes((prev) =>
          prev.map((sc) =>
            sc.session.id === sessionId
              ? {
                  ...sc,
                  codes: sc.codes.map((c) =>
                    c.seat_label === seatLabel ? { ...c, used: true } : c
                  ),
                }
              : sc
          )
        )
      } else {
        const data = await res.json()
        setError(data.error ?? "Failed to revoke code")
      }
    } catch {
      setError("Network error revoking code")
    } finally {
      setActionLoading(null)
    }
  }

  // Stats
  const totalSessions = sessionCodes.length
  const activeSessions = sessionCodes.filter((sc) => sc.session.phase !== "finished").length

  // Filter & search
  const filtered = sessionCodes.filter((sc) => {
    if (filterStatus === "active" && sc.session.phase === "finished") return false
    if (filterStatus === "completed" && sc.session.phase !== "finished") return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        sc.event?.name.toLowerCase().includes(q) ||
        sc.session.id.toLowerCase().includes(q) ||
        sc.codes.some((c) => (c.code ?? "").toLowerCase().includes(q) || c.seat_label.toLowerCase().includes(q))
      )
    }
    return true
  })

  const phaseLabel = (phase: string) => {
    switch (phase) {
      case "lobby": return { text: "Lobby", cls: "bg-slate-700/50 text-slate-300 border-slate-600" }
      case "picking": return { text: "Live", cls: "bg-green-500/10 text-green-400 border-green-500/30" }
      case "paused": return { text: "Paused", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" }
      case "finished": return { text: "Completed", cls: "bg-slate-700/30 text-slate-500 border-slate-700" }
      default: return { text: phase, cls: "bg-slate-700/50 text-slate-400 border-slate-600" }
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading captain codes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide text-slate-100">Captain Codes</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Manage one-time authentication codes for draft captains.
            </p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-100 tabular-nums">{totalSessions}</p>
              <p className="text-xs text-slate-500">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-100 tabular-nums">{activeSessions}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-100 tabular-nums">
                {sessionCodes.reduce((acc, sc) => acc + sc.codes.length, 0) || "--"}
              </p>
              <p className="text-xs text-slate-500">Total Codes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-6 bg-red-400/5 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-300 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by event name, session ID, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800/60 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === f
                  ? "bg-slate-700 text-slate-100 border border-slate-600"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Completed"}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAll}
            className="border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm mb-1">No draft sessions found</p>
            <p className="text-slate-600 text-xs">
              Create a draft session from the{" "}
              <Link href="/admin/drafts" className="text-blue-400 hover:underline">
                Draft Room
              </Link>{" "}
              to generate captain codes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((sc) => {
            const pl = phaseLabel(sc.session.phase)
            const codesWithCode = sc.codes.filter((c) => c.code)
            const usedCount = codesWithCode.filter((c) => c.used).length
            const totalCodes = codesWithCode.length

            return (
              <Card
                key={sc.session.id}
                className={`border transition-colors ${
                  sc.expanded
                    ? "bg-slate-800/60 border-blue-500/20"
                    : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                <CardContent className="p-0">
                  {/* Session row header */}
                  <button
                    onClick={() => toggleExpand(sc.session.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    <div className="shrink-0 text-slate-500">
                      {sc.expanded ? (
                        <ChevronDown className="h-4 w-4 text-blue-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-slate-200 truncate">
                          {sc.event?.name ?? "Unknown Event"}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${pl.cls}`}>
                          {pl.text}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        {sc.session.id.slice(0, 12)}...
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 shrink-0">
                      {totalCodes > 0 && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {usedCount}/{totalCodes} used
                        </span>
                      )}
                      <span>
                        {new Date(sc.session.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </button>

                  {/* Expanded codes panel */}
                  {sc.expanded && (
                    <div className="border-t border-slate-700/50 px-5 py-5">
                      {sc.loading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading codes...
                        </div>
                      ) : sc.codes.length === 0 || sc.codes.every((c) => !c.code) ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <p className="text-sm text-slate-500">
                            {sc.codes.length === 0
                              ? "No captain seats found for this session."
                              : "Seats exist but no codes have been generated yet."}
                          </p>
                          {sc.codes.length > 0 && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={actionLoading === "gen_" + sc.session.id}
                              onClick={async () => {
                                setActionLoading("gen_" + sc.session.id)
                                setError(null)
                                try {
                                  console.log("[v0] Generating codes for session:", sc.session.id)
                                  const res = await fetch(`/api/draft/${sc.session.id}/codes`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ _action: "generate_all" }),
                                  })
                                  const d = await res.json()
                                  console.log("[v0] Generate response:", res.status, d)
                                  if (res.ok) {
                                    // Refresh codes
                                    const codesRes = await fetch(`/api/draft/${sc.session.id}/codes`)
                                    const codesData = await codesRes.json()
                                    console.log("[v0] Refreshed codes:", codesData.codes?.length)
                                    setSessionCodes((prev) =>
                                      prev.map((s) =>
                                        s.session.id === sc.session.id
                                          ? { ...s, codes: codesData.codes ?? [] }
                                          : s
                                      )
                                    )
                                  } else {
                                    setError(d.error ?? d.details ?? "Failed to generate codes")
                                  }
                                } catch (e) {
                                  console.error("[v0] Generate error:", e)
                                  setError("Network error generating codes")
                                } finally {
                                  setActionLoading(null)
                                }
                              }}
                            >
                              {actionLoading === "gen_" + sc.session.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              ) : (
                                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              Generate Codes
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Toolbar for codes */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {sc.codes.length} code{sc.codes.length !== 1 ? "s" : ""}
                                {usedCount > 0 && (
                                  <span className="text-yellow-500/80 ml-1">
                                    ({usedCount} redeemed)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {sc.codes.some((c) => !c.code) && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                                  disabled={actionLoading === "gen_" + sc.session.id}
                                  onClick={async () => {
                                    setActionLoading("gen_" + sc.session.id)
                                    setError(null)
                                    try {
                                      const res = await fetch(`/api/draft/${sc.session.id}/codes`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ _action: "generate_all" }),
                                      })
                                      const d = await res.json()
                                      if (res.ok) {
                                        const codesRes = await fetch(`/api/draft/${sc.session.id}/codes`)
                                        const codesData = await codesRes.json()
                                        setSessionCodes((prev) =>
                                          prev.map((s) =>
                                            s.session.id === sc.session.id
                                              ? { ...s, codes: codesData.codes ?? [] }
                                              : s
                                          )
                                        )
                                      } else {
                                        setError(d.error ?? d.details ?? "Failed to generate codes")
                                      }
                                    } catch {
                                      setError("Failed to generate codes")
                                    } finally {
                                      setActionLoading(null)
                                    }
                                  }}
                                >
                                  {actionLoading === "gen_" + sc.session.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <KeyRound className="h-3 w-3 mr-1" />
                                  )}
                                  Generate Missing
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-200 h-7 text-xs"
                                onClick={() => copyAllCodes(sc)}
                              >
                                {copiedCode === "__all__" + sc.session.id ? (
                                  <><CheckCircle2 className="h-3 w-3 mr-1 text-green-400" /> Copied!</>
                                ) : (
                                  <><Clipboard className="h-3 w-3 mr-1" /> Copy All</>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-200 h-7 text-xs"
                                asChild
                              >
                                <Link href={`/draft/${sc.session.id}`} target="_blank">
                                  <ExternalLink className="h-3 w-3 mr-1" /> Spectate
                                </Link>
                              </Button>
                            </div>
                          </div>

                          {/* Code cards grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sc.codes.filter((c) => c.code).map((c) => (
                              <div
                                key={(c.code ?? "") + c.seat_label}
                                className={`group relative rounded-lg border p-4 transition-all ${
                                  c.used
                                    ? "bg-slate-900/40 border-slate-700/40"
                                    : "bg-slate-900/60 border-slate-700 hover:border-slate-600"
                                }`}
                              >
                                {/* Status dot */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        c.used ? "bg-yellow-500/50" : "bg-green-500"
                                      }`}
                                    />
                                    <span className="text-xs font-medium text-slate-400">
                                      {c.seat_label}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                      c.used
                                        ? "bg-yellow-500/10 text-yellow-500/70 border border-yellow-500/20"
                                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                                    }`}
                                  >
                                    {c.used ? "Redeemed" : "Available"}
                                  </span>
                                </div>

                                {/* Code display */}
                                <div className={`font-mono text-lg tracking-[0.2em] mb-3 ${
                                  !c.code ? "text-slate-600 italic text-sm" : c.used ? "text-slate-600" : "text-slate-100"
                                }`}>
                                  {c.code ?? "No code"}
                                </div>

                                {c.captain_name && c.captain_name !== c.seat_label && (
                                  <p className="text-xs text-slate-500 mb-3 truncate">
                                    {c.captain_name}
                                  </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => c.code && copyCode(c.code)}
                                    className="h-7 px-2 text-xs text-slate-500 hover:text-slate-200"
                                    disabled={c.used || !c.code}
                                  >
                                    {copiedCode === c.code ? (
                                      <><CheckCircle2 className="h-3 w-3 mr-1 text-green-400" /> Copied</>
                                    ) : (
                                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                                    )}
                                  </Button>
                                  {!c.used && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => regenerateCode(sc.session.id, c.seat_label, c.code ?? "")}
                                      disabled={actionLoading === c.code || !c.code}
                                      className="h-7 px-2 text-xs text-slate-500 hover:text-blue-400"
                                    >
                                      {actionLoading === c.code ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <><RotateCcw className="h-3 w-3 mr-1" /> Regenerate</>
                                      )}
                                    </Button>
                                  )}
                                  {!c.used && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => revokeCode(sc.session.id, c.seat_label, c.code ?? "")}
                                      disabled={actionLoading === c.code || !c.code}
                                      className="h-7 px-2 text-xs text-slate-500 hover:text-red-400"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" /> Revoke
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Footer guidance */}
      <div className="mt-8 px-5 py-4 bg-slate-800/20 border border-slate-700/30 rounded-lg">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">How Captain Codes Work</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500 leading-relaxed">
          <div className="flex gap-2">
            <span className="text-blue-400 font-mono font-bold shrink-0">01</span>
            <p>Codes are generated automatically when you create a draft session. Each captain seat gets a unique one-time code.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-mono font-bold shrink-0">02</span>
            <p>Share codes privately with captains. They enter the code at the Draft Room to authenticate and access their bidding panel.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-mono font-bold shrink-0">03</span>
            <p>Codes can be regenerated if compromised, or revoked to prevent unauthorized access. Used codes cannot be reused.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
