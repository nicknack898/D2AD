"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD"
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const statusLabels: Record<string, { label: string; color: string }> = {
  registration_open: { label: "Registration Open", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  registration_closed: { label: "Registration Closed", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  draft: { label: "Coming Soon", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const { data: eventRes, isLoading } = useSWR(`/api/events/${slug}`, fetcher)
  const { data: playersRes } = useSWR(`/api/events/${slug}/players?status=confirmed`, fetcher)

  const event = eventRes?.data
  const players = playersRes?.data ?? []

  const [form, setForm] = useState({
    discord_id: "",
    display_name: "",
    rating: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.rating ? parseInt(form.rating, 10) : null,
        }),
      })
      const json = await res.json()

      if (res.ok) {
        setResult({ ok: true, msg: json.message || "Registration successful!" })
        setForm({ discord_id: "", display_name: "", rating: "", notes: "" })
        mutate(`/api/events/${slug}`)
        mutate(`/api/events/${slug}/players?status=confirmed`)
      } else {
        setResult({ ok: false, msg: json.message || json.error || "Registration failed." })
      }
    } catch {
      setResult({ ok: false, msg: "Something went wrong. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Event not found</h1>
          <Button variant="outline" className="text-slate-300 border-slate-600" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const st = statusLabels[event.status] ?? statusLabels.draft
  const isOpen = event.status === "registration_open"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> All Events
        </Link>

        {/* Event header */}
        <div className="mb-8">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${st.color} inline-block mb-3`}>
            {st.label}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-bebas tracking-wide mb-4">
            {event.name}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            {event.starts_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(event.starts_at)}
              </span>
            )}
            {event.registration_closes_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Reg closes {formatDate(event.registration_closes_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {event.player_count ?? players.length} registered
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {event.description && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Player Pool */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Registered Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <p className="text-slate-500 text-sm">No players registered yet. Be the first!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {players.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 bg-slate-700/30 rounded-lg px-3 py-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {p.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.display_name}</p>
                          <p className="text-slate-500 text-xs truncate">{p.discord_id}</p>
                        </div>
                        {p.rating && (
                          <span className="ml-auto text-xs text-slate-400 shrink-0">
                            ~{p.rating} MMR
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Registration form */}
          <div className="space-y-6">
            {isOpen ? (
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Register as Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-1 block">Discord Username *</label>
                      <Input
                        required
                        placeholder="e.g. player#1234"
                        value={form.discord_id}
                        onChange={(e) => setForm({ ...form, discord_id: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 mb-1 block">In-Game Name *</label>
                      <Input
                        required
                        placeholder="Your Dota 2 display name"
                        value={form.display_name}
                        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 mb-1 block">Estimated MMR</label>
                      <Input
                        type="number"
                        placeholder="e.g. 3500"
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 mb-1 block">Notes (optional)</label>
                      <Textarea
                        placeholder="Anything captains should know..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                        rows={3}
                      />
                    </div>

                    {result && (
                      <div
                        className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
                          result.ok
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {result.ok ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        )}
                        {result.msg}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400 mb-4">
                    {event.status === "draft"
                      ? "Registration has not opened yet for this event."
                      : "Registration is currently closed."}
                  </p>
                  <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
                    <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Get notified on Discord
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
