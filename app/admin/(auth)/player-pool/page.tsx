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
  Upload,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
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

  // Manual add player
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    display_name: "", discord_id: "", steam_id: "", rating: "", notes: "",
  })
  const [addLoading, setAddLoading] = useState(false)

  // CSV import
  const [showImport, setShowImport] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [csvParsed, setCsvParsed] = useState<any[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

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

  const handleBulkRemove = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Permanently remove ${selectedIds.size} player(s) from the pool?`)) return
    setBulkLoading(true)
    setActionError(null)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/events/${slug}/players`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _action: "remove_player", player_id: id }),
          })
        )
      )
      setSelectedIds(new Set())
      mutate(`/api/events/${slug}/players`)
    } catch {
      setActionError("Some removals failed. Please try again.")
    } finally {
      setBulkLoading(false)
    }
  }, [selectedIds, slug])

  async function removePlayer(playerId: string) {
    setActionError(null)
    try {
      await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "remove_player", player_id: playerId }),
      })
      mutate(`/api/events/${slug}/players`)
    } catch {
      setActionError("Failed to remove player")
    }
  }

  async function handleAddPlayer() {
    if (!addForm.display_name.trim() || !addForm.discord_id.trim()) {
      setActionError("Display name and Discord ID are required")
      return
    }
    setAddLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "add_player",
          display_name: addForm.display_name.trim(),
          discord_id: addForm.discord_id.trim(),
          steam_id: addForm.steam_id.trim() || null,
          rating: addForm.rating ? parseInt(addForm.rating, 10) : null,
          notes: addForm.notes.trim() || null,
          status: "confirmed",
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setActionError(json.error || "Failed to add player")
      } else {
        setAddForm({ display_name: "", discord_id: "", steam_id: "", rating: "", notes: "" })
        setShowAddForm(false)
        mutate(`/api/events/${slug}/players`)
      }
    } catch {
      setActionError("Network error adding player")
    } finally {
      setAddLoading(false)
    }
  }

  function parseCSV(text: string) {
    const lines = text.trim().split("\n").filter(Boolean)
    if (lines.length === 0) return []
    // Detect header: if first line contains "display_name" or "discord" (case-insensitive), skip it
    let startIdx = 0
    if (lines[0].toLowerCase().includes("display_name") || lines[0].toLowerCase().includes("discord")) {
      startIdx = 1
    }
    const players: any[] = []
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      if (cols.length >= 2) {
        players.push({
          display_name: cols[0] || "",
          discord_id: cols[1] || "",
          steam_id: cols[2] || "",
          rating: cols[3] || "",
          notes: cols[4] || "",
        })
      }
    }
    return players
  }

  function handleCSVChange(text: string) {
    setCsvText(text)
    setImportResult(null)
    setCsvParsed(parseCSV(text))
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvText(text)
      setImportResult(null)
      setCsvParsed(parseCSV(text))
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  async function handleBulkImport() {
    if (csvParsed.length === 0) return
    setImportLoading(true)
    setImportResult(null)
    setActionError(null)
    try {
      const res = await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "bulk_import",
          players: csvParsed.map((p) => ({
            ...p,
            rating: p.rating ? parseInt(p.rating, 10) : null,
          })),
        }),
      })
      const json = await res.json()
      setImportResult({ imported: json.imported ?? 0, skipped: json.skipped ?? 0, errors: json.errors ?? [] })
      if (json.imported > 0) {
        mutate(`/api/events/${slug}/players`)
      }
    } catch {
      setActionError("Network error during import")
    } finally {
      setImportLoading(false)
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
              className="flex items-center gap-3 bg-card border border-green-500/30 rounded-lg px-4 py-3 shadow-lg shadow-black/20 animate-in slide-in-from-right-5 fade-in duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground font-medium truncate">New Registration</p>
                <p className="text-xs text-muted-foreground truncate">{toast.name} joined the pool</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-muted-foreground/60 hover:text-foreground transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Player Pool</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage registered players, update statuses, and prepare the pool for drafting.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              autoRefresh
                ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                : "bg-card text-muted-foreground/60 border-border hover:bg-muted"
            }`}
            title={autoRefresh ? "Auto-refresh enabled (10s)" : "Auto-refresh disabled"}
          >
            <Radio className={`h-3 w-3 ${autoRefresh ? "animate-pulse" : ""}`} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground/80 hover:bg-muted"
            onClick={() => mutate(`/api/events/${slug}/players`)}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={() => { setShowAddForm(!showAddForm); setShowImport(false) }}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Player
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => { setShowImport(!showImport); setShowAddForm(false) }}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Import CSV
          </Button>
          {filteredPlayers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground/80 hover:bg-muted"
              onClick={exportCSV}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Manual Add Player Form */}
      {showAddForm && slug && (
        <Card className="bg-card/60 border-blue-500/20">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-400" /> Add Player Manually
              </h3>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-7 w-7 p-0" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Display Name *</label>
                <Input
                  placeholder="In-game name"
                  value={addForm.display_name}
                  onChange={(e) => setAddForm({ ...addForm, display_name: e.target.value })}
                  className="bg-background border-border text-foreground text-sm h-9"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Discord ID *</label>
                <Input
                  placeholder="player#1234"
                  value={addForm.discord_id}
                  onChange={(e) => setAddForm({ ...addForm, discord_id: e.target.value })}
                  className="bg-background border-border text-foreground text-sm h-9"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Steam ID</label>
                <Input
                  placeholder="76561198..."
                  value={addForm.steam_id}
                  onChange={(e) => setAddForm({ ...addForm, steam_id: e.target.value })}
                  className="bg-background border-border text-foreground text-sm h-9"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">MMR</label>
                <Input
                  type="number"
                  placeholder="e.g. 3500"
                  value={addForm.rating}
                  onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
                  className="bg-background border-border text-foreground text-sm h-9"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddPlayer}
                  disabled={addLoading || !addForm.display_name || !addForm.discord_id}
                  className="bg-blue-600 hover:bg-blue-700 text-foreground h-9 w-full"
                  size="sm"
                >
                  {addLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1" /> Add</>}
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Input
                placeholder="Notes (optional)"
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                className="bg-background border-border text-foreground text-sm h-9"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Import Panel */}
      {showImport && slug && (
        <Card className="bg-card/60 border-yellow-500/20">
          <CardContent className="py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-yellow-400" /> Bulk Import Players
              </h3>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-7 w-7 p-0" onClick={() => setShowImport(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-background/60 rounded-lg px-4 py-3 text-xs text-muted-foreground border border-border">
              <p className="font-medium text-foreground/80 mb-1">CSV Format</p>
              <p className="font-mono text-muted-foreground/60">display_name, discord_id, steam_id, rating, notes</p>
              <p className="mt-1">First row is auto-skipped if it contains column headers. Max 200 players per import.</p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder={"PlayerOne, player1#1234, 76561198..., 3500, loves mid\nPlayerTwo, player2#5678, , 2800, pos 5 main"}
                  value={csvText}
                  onChange={(e) => handleCSVChange(e.target.value)}
                  className="bg-background border-border text-foreground text-xs font-mono resize-none h-28 placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="sr-only" />
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors text-xs">
                    <Upload className="h-3.5 w-3.5" /> Upload File
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {csvParsed.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{csvParsed.length} player{csvParsed.length !== 1 ? "s" : ""} detected</p>
                <div className="max-h-40 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-card sticky top-0">
                      <tr className="text-muted-foreground/60">
                        <th className="text-left px-3 py-1.5 font-medium">Name</th>
                        <th className="text-left px-3 py-1.5 font-medium">Discord</th>
                        <th className="text-left px-3 py-1.5 font-medium">Steam</th>
                        <th className="text-right px-3 py-1.5 font-medium">MMR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {csvParsed.slice(0, 20).map((p, i) => (
                        <tr key={i} className={`${!p.display_name || !p.discord_id ? "bg-red-500/5" : ""}`}>
                          <td className="px-3 py-1.5 text-foreground">{p.display_name || <span className="text-red-400">missing</span>}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{p.discord_id || <span className="text-red-400">missing</span>}</td>
                          <td className="px-3 py-1.5 text-muted-foreground/60">{p.steam_id || "-"}</td>
                          <td className="px-3 py-1.5 text-right text-muted-foreground tabular-nums">{p.rating || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvParsed.length > 20 && (
                    <p className="text-xs text-muted-foreground/60 px-3 py-1.5 bg-card">... and {csvParsed.length - 20} more</p>
                  )}
                </div>

                <Button
                  onClick={handleBulkImport}
                  disabled={importLoading || csvParsed.length === 0}
                  className="bg-yellow-600 hover:bg-yellow-700 text-foreground w-full"
                  size="sm"
                >
                  {importLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Importing...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5 mr-1.5" /> Import {csvParsed.length} Player{csvParsed.length !== 1 ? "s" : ""}</>
                  )}
                </Button>
              </div>
            )}

            {/* Import results */}
            {importResult && (
              <div className={`rounded-lg px-4 py-3 text-sm border ${
                importResult.errors.length > 0
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  : "bg-green-500/10 border-green-500/20 text-green-400"
              }`}>
                <p className="font-medium">
                  {importResult.imported} imported, {importResult.skipped} skipped
                </p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 text-xs space-y-0.5 text-yellow-400/80 max-h-20 overflow-auto">
                    {importResult.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>... and {importResult.errors.length - 10} more</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-56">
          <label className="text-xs text-muted-foreground mb-1 block">Event</label>
          <Select value={slug} onValueChange={(v) => { setSelectedEvent(v); setSelectedIds(new Set()) }}>
            <SelectTrigger className="bg-muted/50 border-border text-foreground">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {events.map((ev: any) => (
                <SelectItem key={ev.slug} value={ev.slug}>{ev.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="text-xs text-muted-foreground mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-muted/50 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search name, Discord, Steam ID, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-border text-foreground pl-10"
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
              variant="outline"
              className="border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 h-7 text-xs"
              onClick={handleBulkRemove}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
              Remove All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground h-7 text-xs"
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
        <Card className="bg-card/50 border-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Select an event to view registered players.</p>
          </CardContent>
        </Card>
      ) : filteredPlayers.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No players match your filters."
                : "No players registered for this event yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs text-muted-foreground/60 font-medium uppercase items-center">
            <div className="col-span-1 flex items-center">
              <button onClick={toggleSelectAll} className="text-muted-foreground/60 hover:text-foreground transition-colors">
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
                  isSelected ? "bg-blue-500/5 border-blue-500/20" : "bg-card/50 border-border"
                }`}
              >
                <CardContent className="grid grid-cols-12 gap-3 items-center py-3">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <button onClick={() => toggleSelect(player.id)} className="text-muted-foreground/60 hover:text-foreground transition-colors">
                      {isSelected ? <CheckSquare className="h-4 w-4 text-blue-400" /> : <Square className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Player name */}
                  <div className="col-span-3">
                    <p className="text-foreground text-sm font-medium truncate">{player.display_name}</p>
                    {player.steam_id && (
                      <p className="text-muted-foreground/60 text-xs truncate">Steam: {player.steam_id}</p>
                    )}
                  </div>

                  {/* Discord */}
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm truncate">{player.discord_id}</p>
                  </div>

                  {/* MMR */}
                  <div className="col-span-1 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        className="bg-background border-border text-foreground text-xs h-7 w-16 mx-auto text-center"
                      />
                    ) : (
                      <span className="text-foreground/80 text-sm tabular-nums">{player.rating ?? "-"}</span>
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
                          className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
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
                          className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground/60 hover:text-red-400 h-7 w-7 p-0"
                          onClick={() => {
                            if (confirm(`Remove ${player.display_name} from the pool?`)) {
                              removePlayer(player.id)
                            }
                          }}
                          title="Remove permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>

                {/* Expandable notes row (when editing) */}
                {isEditing && (
                  <div className="px-6 pb-3 border-t border-border/50 pt-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                    <Input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Admin notes..."
                      className="bg-background border-border text-foreground text-sm h-8"
                    />
                  </div>
                )}
              </Card>
            )
          })}

          <p className="text-xs text-muted-foreground/60 text-center pt-2">
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
        className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? "text-blue-400" : ""}`}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "text-blue-400" : "opacity-50"}`} />
      </button>
    </div>
  )
}
