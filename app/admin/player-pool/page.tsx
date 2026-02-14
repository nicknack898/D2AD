"use client"

import { useState } from "react"
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
import { Loader2, Search, Check, X, ArrowUpDown } from "lucide-react"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPlayerPoolPage() {
  const searchParams = useSearchParams()
  const eventParam = searchParams.get("event")

  const { data: eventsRes, isLoading: eventsLoading } = useSWR("/api/events", fetcher)
  const events = eventsRes?.data ?? []

  const [selectedEvent, setSelectedEvent] = useState(eventParam || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "mmr_estimate">("created_at")

  const slug = selectedEvent || events[0]?.slug || ""
  const { data: playersRes, isLoading: playersLoading } = useSWR(
    slug ? `/api/events/${slug}/players` : null,
    fetcher,
  )
  const players = playersRes?.data ?? []

  const filteredPlayers = players
    .filter((p: any) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        p.discord_username?.toLowerCase().includes(q) ||
        p.in_game_name?.toLowerCase().includes(q)
      )
    })
    .sort((a: any, b: any) => {
      if (sortBy === "mmr_estimate") return (b.mmr_estimate ?? 0) - (a.mmr_estimate ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  async function updatePlayerStatus(playerId: string, status: string) {
    await fetch(`/api/events/${slug}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "update_status", player_id: playerId, status }),
    }).catch(() => {})
    // For now, we'll re-fetch
    mutate(`/api/events/${slug}/players`)
  }

  const confirmed = players.filter((p: any) => p.status === "confirmed").length
  const pending = players.filter((p: any) => p.status === "pending").length
  const dropped = players.filter((p: any) => p.status === "dropped").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Player Pool</h1>
        <p className="text-slate-400 text-sm mt-1">View and manage registered players per event.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <label className="text-xs text-slate-400 mb-1 block">Event</label>
          <Select value={slug} onValueChange={setSelectedEvent}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {events.map((ev: any) => (
                <SelectItem key={ev.slug} value={ev.slug}>
                  {ev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-slate-400 mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or Discord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => setSortBy(sortBy === "created_at" ? "mmr_estimate" : "created_at")}
        >
          <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
          Sort: {sortBy === "mmr_estimate" ? "MMR" : "Date"}
        </Button>
      </div>

      {/* Stats */}
      {slug && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-400">{confirmed}</p>
              <p className="text-xs text-green-400/70">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{pending}</p>
              <p className="text-xs text-yellow-400/70">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-red-400">{dropped}</p>
              <p className="text-xs text-red-400/70">Dropped</p>
            </CardContent>
          </Card>
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
            <p className="text-slate-400">Select an event to view registered players.</p>
          </CardContent>
        </Card>
      ) : filteredPlayers.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">
              {searchQuery ? "No players match your search." : "No players registered for this event yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-500 font-medium uppercase">
            <div className="col-span-3">Player</div>
            <div className="col-span-2">Discord</div>
            <div className="col-span-1 text-center">MMR</div>
            <div className="col-span-3">Roles</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredPlayers.map((player: any) => (
            <Card key={player.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="grid grid-cols-12 gap-4 items-center py-3">
                <div className="col-span-3">
                  <p className="text-white text-sm font-medium truncate">{player.in_game_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-sm truncate">{player.discord_username}</p>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-slate-300 text-sm">{player.mmr_estimate ?? "-"}</span>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {(player.preferred_roles ?? []).map((role: string) => (
                      <span
                        key={role}
                        className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600"
                      >
                        {role}
                      </span>
                    ))}
                    {(!player.preferred_roles || player.preferred_roles.length === 0) && (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      player.status === "confirmed"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : player.status === "dropped"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
