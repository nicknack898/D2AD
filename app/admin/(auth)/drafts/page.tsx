"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Gavel,
  Plus,
  Loader2,
  Copy,
  CheckCircle2,
  Play,
  Pause,
  SkipForward,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  name: string
  slug: string
  status: string
}

interface DraftSession {
  id: string
  event_id: string
  phase: string
  seconds_per_lot: number
  created_at: string
}

interface SeatCode {
  seat_label: string
  code: string
}

export default function AdminDraftsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [sessions, setSessions] = useState<DraftSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [codes, setCodes] = useState<SeatCode[]>([])
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null)
  const [viewCodes, setViewCodes] = useState<SeatCode[]>([])
  const [viewCodesLoading, setViewCodesLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Create form
  const [selectedEventId, setSelectedEventId] = useState("")
  const [captainCount, setCaptainCount] = useState("2")
  const [budget, setBudget] = useState("1000")
  const [secondsPerLot, setSecondsPerLot] = useState("30")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [evRes, sessResponse] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/draft/list"),
      ])
      const evData = await evRes.json()
      setEvents(evData.data ?? [])

      if (sessResponse.ok) {
        const sessData = await sessResponse.json()
        setSessions(sessData.data ?? [])
      }
    } catch {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async () => {
    if (!selectedEventId) return
    setCreating(true)
    setError(null)
    setCodes([])

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEventId,
          captain_count: parseInt(captainCount),
          budget_per_captain: parseInt(budget),
          seconds_per_lot: parseInt(secondsPerLot),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create draft")
        return
      }
      setCodes(data.codes ?? [])
      setShowCreate(false)
      fetchData()
    } catch {
      setError("Network error")
    } finally {
      setCreating(false)
    }
  }

  const handleAdvance = async (sessionId: string, action: string) => {
    try {
      const res = await fetch(`/api/draft/${sessionId}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Action failed")
        return
      }
      fetchData()
    } catch {
      setError("Network error")
    }
  }

  const handleDelete = async (sessionId: string, eventName: string) => {
    if (!confirm(`Delete the draft session for "${eventName}"? This will remove all seats, codes, lots, and bids. This cannot be undone.`)) return
    setError(null)
    try {
      const res = await fetch(`/api/draft/${sessionId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to delete draft")
        return
      }
      // Clear codes view if showing for this session
      if (viewingSessionId === sessionId) {
        setViewingSessionId(null)
        setViewCodes([])
      }
      fetchData()
    } catch {
      setError("Network error deleting draft")
    }
  }

  const handleViewCodes = async (sessionId: string) => {
    if (viewingSessionId === sessionId) {
      setViewingSessionId(null)
      setViewCodes([])
      return
    }
    setViewCodesLoading(true)
    setViewingSessionId(sessionId)
    try {
      const res = await fetch(`/api/draft/${sessionId}/codes`)
      const data = await res.json()
      setViewCodes(data.codes ?? [])
    } catch {
      setError("Failed to load codes")
    } finally {
      setViewCodesLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading drafts...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gavel className="h-6 w-6 text-blue-400" />
          <h1 className="font-bebas text-3xl tracking-wide">Draft Sessions</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> New Draft
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">x</button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="font-teko text-xl mb-4">Create Draft Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select event...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Captains</label>
              <Input
                type="number"
                value={captainCount}
                onChange={(e) => setCaptainCount(e.target.value)}
                className="bg-background border-border"
                min={2}
                max={12}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Budget per Captain</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-background border-border"
                min={10}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Seconds per Lot</label>
              <Input
                type="number"
                value={secondsPerLot}
                onChange={(e) => setSecondsPerLot(e.target.value)}
                className="bg-background border-border"
                min={5}
                max={300}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleCreate} disabled={creating || !selectedEventId} className="bg-green-600 hover:bg-green-700">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Create Draft
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Captain Codes (shown after creation) */}
      {codes.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
          <h2 className="font-teko text-xl text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Draft Created - Captain Codes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share these one-time codes with each captain. They will use them to log into the captain panel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {codes.map((c) => (
              <div key={c.code} className="flex items-center justify-between bg-card rounded-lg px-4 py-3 border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">{c.seat_label}</p>
                  <p className="font-mono text-lg text-foreground tracking-widest">{c.code}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(c.code)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copiedCode === c.code ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-card/50 border border-border rounded-lg p-8 text-center">
          <Gavel className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No draft sessions yet. Create one from an event with confirmed players.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => {
            const event = events.find((e) => e.id === sess.event_id)
            return (
              <div key={sess.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-teko text-lg text-foreground">{event?.name ?? "Unknown Event"}</h3>
                    <p className="text-xs text-muted-foreground/60">
                      Session: {sess.id.slice(0, 8)}... | Phase: <span className="text-foreground/80">{sess.phase}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sess.phase === "lobby" && (
                      <Button size="sm" onClick={() => handleAdvance(sess.id, "start")} className="bg-green-600 hover:bg-green-700">
                        <Play className="h-3.5 w-3.5 mr-1" /> Start
                      </Button>
                    )}
                    {sess.phase === "picking" && (
                      <>
                        <Button size="sm" onClick={() => handleAdvance(sess.id, "close_lot")} className="bg-blue-600 hover:bg-blue-700">
                          <SkipForward className="h-3.5 w-3.5 mr-1" /> Next Lot
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAdvance(sess.id, "pause")}>
                          <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                        </Button>
                      </>
                    )}
                    {sess.phase === "paused" && (
                      <Button size="sm" onClick={() => handleAdvance(sess.id, "resume")} className="bg-green-600 hover:bg-green-700">
                        <Play className="h-3.5 w-3.5 mr-1" /> Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCodes(sess.id)}
                      className={viewingSessionId === sess.id ? "border-yellow-500/50 text-yellow-400" : ""}
                    >
                      <KeyRound className="h-3.5 w-3.5 mr-1" /> Codes
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/draft/${sess.id}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Spectator
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                      onClick={() => handleDelete(sess.id, event?.name ?? "Unknown")}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                {/* Expandable Codes Panel */}
                {viewingSessionId === sess.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {viewCodesLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading codes...
                      </div>
                    ) : viewCodes.length === 0 ? (
                      <p className="text-sm text-muted-foreground/60 py-2">No codes found for this session.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {viewCodes.map((c: any) => (
                          <div
                            key={c.code}
                            className={`flex items-center justify-between bg-background rounded-lg px-4 py-2.5 border ${c.used ? "border-border opacity-60" : "border-border"}`}
                          >
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {c.seat_label}
                                {c.used && <span className="ml-2 text-yellow-500">(Used)</span>}
                              </p>
                              <p className="font-mono text-base text-foreground tracking-widest">{c.code}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(c.code)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedCode === c.code ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
