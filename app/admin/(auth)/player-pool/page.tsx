"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Search,
  Check,
  X,
  ArrowUpDown,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  RefreshCw,
  UserPlus,
  Pencil,
  Save,
  AlertCircle,
  Users,
  Bell,
  Radio,
} from "lucide-react"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SortKey = "created_at" | "rating" | "display_name" | "status"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "dropped", label: "Dropped" },
]

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  dropped: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function AdminPlayerPoolPage() {
  const searchParams = useSearchParams()
  const eventParam = searchParams.get("event")

  const { data: eventsRes, isLoading: eventsLoading } = useSWR("/api/events", fetcher)
  const events = eventsRes?.data ?? []

  const [selectedEvent, setSelectedEvent] = useState(eventParam || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const [toasts, setToasts] = useState<{ id: string; name: string; time: number }[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const prevPlayerIdsRef = useRef<Set<string>>(new Set())
  const initialLoadRef = useRef(true)

  const slug = selectedEvent || events[0]?.slug || ""
  const { data: playersRes, isLoading: playersLoading } = useSWR(
    slug ? `/api/events/${slug}/players` : null,
    fetcher,
    { refreshInterval: autoRefresh ? 10000 : 0 },
  )
  const allPlayers: any[] = playersRes?.data ?? []

  // Detect new players and show toast notifications
  useEffect(() => {
    if (allPlayers.length === 0) return
    const currentIds = new Set(allPlayers.map((p: any) => p.id))

    if (initialLoadRef.current) {
      prevPlayerIdsRef.current = currentIds
      initialLoadRef.current = false
      return
    }

    const newPlayers = allPlayers.filter((p: any) => !prevPlayerIdsRef.current.has(p.id))
    if (newPlayers.length > 0) {
      const newToasts = newPlayers.map((p: any) => ({
        id: p.id,
        name: p.display_name ?? "Unknown",
        time: Date.now(),
      }))
      setToasts((prev) => [...newToasts, ...prev].slice(0, 5))
    }
    prevPlayerIdsRef.current = currentIds
  }, [allPlayers])

  // Auto-dismiss toasts after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => Date.now() - t.time < 8000))
    }, 8000)
    return () => clearTimeout(timer)
  }, [toasts])

  const filteredPlayers = useMemo(() => {
    let list = [...allPlayers]
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.discord_id?.toLowerCase().includes(q) ||
          p.display_name?.toLowerCase().includes(q) ||
          p.steam_id?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case "rating":
          cmp = (a.rating ?? 0) - (b.rating ?? 0)
          break
        case "display_name":
          cmp = (a.display_name ?? "").localeCompare(b.display_name ?? "")
          break
        case "status":
          cmp = (a.status ?? "").localeCompare(b.status ?? "")
          break
        default:
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDir === "desc" ? -cmp : cmp
    })
    return list
  }, [allPlayers, statusFilter, searchQuery, sortBy, sortDir])

  const stats = useMemo(() => ({
    total: allPlayers.length,
    confirmed: allPlayers.filter((p) => p.status === "confirmed").length,
    pending: allPlayers.filter((p) => p.status === "pending").length,
    dropped: allPlayers.filter((p) => p.status === "dropped").length,
    avgRating: allPlayers.filter((p) => p.rating).length > 0
      ? Math.round(allPlayers.filter((p) => p.rating).reduce((sum: number, p: any) => sum + p.rating, 0) / allPlayers.filter((p: any) => p.rating).length)
      : 0,
  }), [allPlayers])

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir(key === "display_name" ? "asc" : "desc")
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredPlayers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPlayers.map((p) => p.id)))
    }
  }

  async function updatePlayerStatus(playerId: string, status: string) {
    setActionError(null)
    try {
      await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "update_status", player_id: playerId, status }),
      })
      mutate(`/api/events/${slug}/players`)
    } catch {
      setActionError("Failed to update player status")
    }
  }

  const handleBulkAction = useCallback(async (status: string) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    setActionError(null)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/events/${slug}/players`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _action: "update_status", player_id: id, status }),
          })
        )
      )
      setSelectedIds(new Set())
      mutate(`/api/events/${slug}/players`)
    } catch {
      setActionError("Some updates failed. Please try again.")
    } finally {
      setBulkLoading(false)
    }
  }, [selectedIds, slug])

  function startEditing(player: any) {
    setEditingId(player.id)
    setEditRating(player.rating?.toString() ?? "")
    setEditNotes(player.notes ?? "")
  }

  async function saveEdit(playerId: string) {
    setActionError(null)
    try {
      await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "update_player",
          player_id: playerId,
          rating: editRating ? parseInt(editRating, 10) : null,
          notes: editNotes || null,
        }),
      })
      setEditingId(null)
      mutate(`/api/events/${slug}/players`)
    } catch {
      setActionError("Failed to save player changes")
    }
  }

  function exportCSV() {
    const headers = ["Display Name", "Discord", "Steam ID", "Rating", "Rating Source", "Status", "Notes", "Registered"]
    const rows = filteredPlayers.map((p) => [
      p.display_name ?? "",
      p.discord_id ?? "",
      p.steam_id ?? "",
      p.rating?.toString() ?? "",
      p.rating_source ?? "",
      p.status ?? "",
      (p.notes ?? "").replace(/"/g, '""'),
      p.created_at ? new Date(p.created_at).toISOString() : "",
    ])
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c: string) => `"${c}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `players-${slug}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const allSelected = filteredPlayers.length > 0 && selectedIds.size === filteredPlayers.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredPlayers.length

  return (
    <div className="space-y-6">
      {/* New player toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center gap-3 bg-slate-800 border border-green-500/30 rounded-lg px-4 py-3 shadow-lg shadow-black/20 animate-in slide-in-from-right-5 fade-in duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">New Registration</p>
                <p className="text-xs text-slate-400 truncate">{toast.name} joined the pool</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Player Pool</h1>
          <p className="text-slate-400 text-sm mt-1">Manage registered players, update statuses, and prepare the pool for drafting.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              autoRefresh
                ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700"
            }`}
            title={autoRefresh ? "Auto-refresh enabled (10s)" : "Auto-refresh disabled"}
          >
            <Radio className={`h-3 w-3 ${autoRefresh ? "animate-pulse" : ""}`} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => mutate(`/api/events/${slug}/players`)}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          {filteredPlayers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={exportCSV}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-56">
          <label className="text-xs text-slate-400 mb-1 block">Event</label>
          <Select value={slug} onValueChange={(v) => { setSelectedEvent(v); setSelectedIds(new Set()) }}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {events.map((ev: any) => (
                <SelectItem key={ev.slug} value={ev.slug}>{ev.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="text-xs text-slate-400 mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-slate-400 mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search name, Discord, Steam ID, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      {slug && !playersLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
          <StatCard label="Confirmed" value={stats.confirmed} color="text-green-400" bg="bg-green-500/10 border-green-500/20" />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/20" />
          <StatCard label="Dropped" value={stats.dropped} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
          <StatCard label="Avg MMR" value={stats.avgRating > 0 ? stats.avgRating.toLocaleString() : "-"} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/20" />
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2.5">
          <span className="text-sm text-blue-400 font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 h-7 text-xs"
              onClick={() => handleBulkAction("confirmed")}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
              Confirm All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs"
              onClick={() => handleBulkAction("dropped")}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
              Drop All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white h-7 text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Player list */}
      {eventsLoading || playersLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : !slug ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Select an event to view registered players.</p>
          </CardContent>
        </Card>
      ) : filteredPlayers.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {searchQuery || statusFilter !== "all"
                ? "No players match your filters."
                : "No players registered for this event yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs text-slate-500 font-medium uppercase items-center">
            <div className="col-span-1 flex items-center">
              <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white transition-colors">
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : someSelected ? (
                  <MinusSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
            </div>
            <SortHeader label="Player" col={3} sortKey="display_name" current={sortBy} dir={sortDir} onClick={handleSort} />
            <div className="col-span-2">Discord</div>
            <SortHeader label="MMR" col={1} sortKey="rating" current={sortBy} dir={sortDir} onClick={handleSort} center />
            <SortHeader label="Status" col={2} sortKey="status" current={sortBy} dir={sortDir} onClick={handleSort} center />
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {filteredPlayers.map((player: any) => {
            const isEditing = editingId === player.id
            const isSelected = selectedIds.has(player.id)

            return (
              <Card
                key={player.id}
                className={`border transition-colors ${
                  isSelected ? "bg-blue-500/5 border-blue-500/20" : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <CardContent className="grid grid-cols-12 gap-3 items-center py-3">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <button onClick={() => toggleSelect(player.id)} className="text-slate-500 hover:text-white transition-colors">
                      {isSelected ? <CheckSquare className="h-4 w-4 text-blue-400" /> : <Square className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Player name */}
                  <div className="col-span-3">
                    <p className="text-white text-sm font-medium truncate">{player.display_name}</p>
                    {player.steam_id && (
                      <p className="text-slate-500 text-xs truncate">Steam: {player.steam_id}</p>
                    )}
                  </div>

                  {/* Discord */}
                  <div className="col-span-2">
                    <p className="text-slate-400 text-sm truncate">{player.discord_id}</p>
                  </div>

                  {/* MMR */}
                  <div className="col-span-1 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white text-xs h-7 w-16 mx-auto text-center"
                      />
                    ) : (
                      <span className="text-slate-300 text-sm tabular-nums">{player.rating ?? "-"}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[player.status] ?? STATUS_COLORS.pending}`}
                    >
                      {player.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex justify-end gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300 h-7 w-7 p-0"
                          onClick={() => saveEdit(player.id)}
                          title="Save"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white h-7 w-7 p-0"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white h-7 w-7 p-0"
                          onClick={() => startEditing(player)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {player.status !== "confirmed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 h-7 w-7 p-0"
                            onClick={() => updatePlayerStatus(player.id, "confirmed")}
                            title="Confirm"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {player.status !== "dropped" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                            onClick={() => updatePlayerStatus(player.id, "dropped")}
                            title="Drop"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>

                {/* Expandable notes row (when editing) */}
                {isEditing && (
                  <div className="px-6 pb-3 border-t border-slate-700/50 pt-2">
                    <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                    <Input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Admin notes..."
                      className="bg-slate-900 border-slate-600 text-white text-sm h-8"
                    />
                  </div>
                )}
              </Card>
            )
          })}

          <p className="text-xs text-slate-500 text-center pt-2">
            Showing {filteredPlayers.length} of {allPlayers.length} players
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, bg }: { label: string; value: number | string; color: string; bg: string }) {
  return (
    <Card className={`${bg} border`}>
      <CardContent className="py-3 text-center">
        <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
        <p className={`text-xs ${color} opacity-70`}>{label}</p>
      </CardContent>
    </Card>
  )
}

function SortHeader({
  label,
  col,
  sortKey,
  current,
  dir,
  onClick,
  center,
}: {
  label: string
  col: number
  sortKey: SortKey
  current: SortKey
  dir: "asc" | "desc"
  onClick: (key: SortKey) => void
  center?: boolean
}) {
  const active = current === sortKey
  return (
    <div className={`col-span-${col} ${center ? "text-center" : ""}`}>
      <button
        onClick={() => onClick(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-white transition-colors ${active ? "text-blue-400" : ""}`}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "text-blue-400" : "opacity-50"}`} />
      </button>
    </div>
  )
}
