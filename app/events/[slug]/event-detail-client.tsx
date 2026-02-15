"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Search,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  User,
  Gamepad2,
  Hash,
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

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  if (days > 0) return `${days}d ${hours}h remaining`
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours}h ${minutes}m remaining`
}

const statusLabels: Record<string, { label: string; color: string }> = {
  registration_open: { label: "Registration Open", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  registration_closed: { label: "Registration Closed", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  draft: { label: "Coming Soon", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

const RATING_SOURCES = [
  { value: "self_reported", label: "Self Reported" },
  { value: "dotabuff", label: "Dotabuff" },
  { value: "opendota", label: "OpenDota" },
  { value: "stratz", label: "Stratz" },
]

type FormData = {
  discord_id: string
  display_name: string
  steam_id: string
  rating: string
  rating_source: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!form.discord_id.trim()) errors.discord_id = "Discord username is required"
  else if (form.discord_id.length > 50) errors.discord_id = "Too long (max 50 characters)"

  if (!form.display_name.trim()) errors.display_name = "In-game name is required"
  else if (form.display_name.length > 50) errors.display_name = "Too long (max 50 characters)"

  if (form.steam_id && form.steam_id.length > 50) errors.steam_id = "Too long (max 50 characters)"

  if (form.rating) {
    const r = parseInt(form.rating, 10)
    if (isNaN(r) || r < 0) errors.rating = "Must be a positive number"
    else if (r > 15000) errors.rating = "That seems too high (max 15000)"
  }

  if (form.notes && form.notes.length > 500) errors.notes = "Too long (max 500 characters)"

  return errors
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const { data: eventRes, isLoading } = useSWR(`/api/events/${slug}`, fetcher)
  const { data: playersRes } = useSWR(`/api/events/${slug}/players?status=confirmed`, fetcher)

  const event = eventRes?.data
  const players = playersRes?.data ?? []

  // Registration form state
  const [form, setForm] = useState<FormData>({
    discord_id: "",
    display_name: "",
    steam_id: "",
    rating: "",
    rating_source: "",
    notes: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Player search/sort
  const [playerSearch, setPlayerSearch] = useState("")
  const [playerSort, setPlayerSort] = useState<"name" | "rating">("name")

  const filteredPlayers = useMemo(() => {
    let list = [...players]
    if (playerSearch) {
      const q = playerSearch.toLowerCase()
      list = list.filter(
        (p: any) =>
          p.display_name?.toLowerCase().includes(q) ||
          p.discord_id?.toLowerCase().includes(q)
      )
    }
    list.sort((a: any, b: any) => {
      if (playerSort === "rating") return (b.rating ?? 0) - (a.rating ?? 0)
      return (a.display_name ?? "").localeCompare(b.display_name ?? "")
    })
    return list
  }, [players, playerSearch, playerSort])

  function handleFieldChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (touched.has(field)) {
      const newForm = { ...form, [field]: value }
      const newErrors = validateForm(newForm)
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }))
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched((prev) => new Set(prev).add(field))
    const newErrors = validateForm(form)
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }))
  }

  function handleReviewClick() {
    setTouched(new Set(["discord_id", "display_name", "steam_id", "rating", "notes"]))
    const newErrors = validateForm(form)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setStep("confirm")
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/events/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.rating ? parseInt(form.rating, 10) : null,
          rating_source: form.rating_source || null,
          steam_id: form.steam_id || null,
          notes: form.notes || null,
        }),
      })
      const json = await res.json()

      if (res.ok) {
        setStep("success")
        mutate(`/api/events/${slug}`)
        mutate(`/api/events/${slug}/players?status=confirmed`)
      } else {
        setSubmitError(json.message || json.error || "Registration failed. Please try again.")
        setStep("form")
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.")
      setStep("form")
    } finally {
      setSubmitting(false)
    }
  }

  function handleRegisterAnother() {
    setForm({ discord_id: "", display_name: "", steam_id: "", rating: "", rating_source: "", notes: "" })
    setErrors({})
    setTouched(new Set())
    setStep("form")
    setSubmitError(null)
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
  const regDeadline = event.registration_closes_at ? timeUntil(event.registration_closes_at) : null

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
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${st.color}`}>
              {st.label}
            </span>
            {isOpen && regDeadline && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                {regDeadline}
              </span>
            )}
          </div>
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
              <Users className="h-4 w-4" /> {players.length} registered
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-white">Registered Players ({players.length})</CardTitle>
                  {players.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <Input
                          placeholder="Search..."
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white pl-8 h-8 text-xs w-40"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white h-8 px-2"
                        onClick={() => setPlayerSort(playerSort === "name" ? "rating" : "name")}
                      >
                        <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">{playerSort === "rating" ? "MMR" : "Name"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <p className="text-slate-500 text-sm">No players registered yet. Be the first!</p>
                ) : filteredPlayers.length === 0 ? (
                  <p className="text-slate-500 text-sm">No players match your search.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredPlayers.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 bg-slate-700/30 rounded-lg px-3 py-2.5 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                          {p.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{p.display_name}</p>
                          <p className="text-slate-500 text-xs truncate">{p.discord_id}</p>
                        </div>
                        {p.rating != null && (
                          <span className="text-xs text-slate-400 shrink-0 tabular-nums">
                            {p.rating.toLocaleString()} MMR
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
              <>
                {/* Step: Form */}
                {step === "form" && (
                  <Card className="bg-slate-800/50 border-green-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-green-400" />
                        Register as Player
                      </CardTitle>
                      <p className="text-slate-400 text-xs">
                        Fill in your details to join the player pool for this event.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Discord ID */}
                        <div>
                          <label className="text-sm text-slate-300 mb-1 block">
                            Discord Username <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                              placeholder="e.g. player#1234"
                              value={form.discord_id}
                              onChange={(e) => handleFieldChange("discord_id", e.target.value)}
                              onBlur={() => handleBlur("discord_id")}
                              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pl-9 ${
                                errors.discord_id && touched.has("discord_id") ? "border-red-500/50" : ""
                              }`}
                            />
                          </div>
                          {errors.discord_id && touched.has("discord_id") && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.discord_id}
                            </p>
                          )}
                        </div>

                        {/* Display Name */}
                        <div>
                          <label className="text-sm text-slate-300 mb-1 block">
                            In-Game Name <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                              placeholder="Your Dota 2 display name"
                              value={form.display_name}
                              onChange={(e) => handleFieldChange("display_name", e.target.value)}
                              onBlur={() => handleBlur("display_name")}
                              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pl-9 ${
                                errors.display_name && touched.has("display_name") ? "border-red-500/50" : ""
                              }`}
                            />
                          </div>
                          {errors.display_name && touched.has("display_name") && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.display_name}
                            </p>
                          )}
                        </div>

                        {/* Steam ID */}
                        <div>
                          <label className="text-sm text-slate-300 mb-1 block">
                            Steam ID <span className="text-slate-500 text-xs">(optional)</span>
                          </label>
                          <Input
                            placeholder="e.g. 76561198012345678"
                            value={form.steam_id}
                            onChange={(e) => handleFieldChange("steam_id", e.target.value)}
                            onBlur={() => handleBlur("steam_id")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                              errors.steam_id && touched.has("steam_id") ? "border-red-500/50" : ""
                            }`}
                          />
                          {errors.steam_id && touched.has("steam_id") && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.steam_id}
                            </p>
                          )}
                        </div>

                        {/* MMR + Source */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-slate-300 mb-1 block">Estimated MMR</label>
                            <Input
                              type="number"
                              placeholder="e.g. 3500"
                              value={form.rating}
                              onChange={(e) => handleFieldChange("rating", e.target.value)}
                              onBlur={() => handleBlur("rating")}
                              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                errors.rating && touched.has("rating") ? "border-red-500/50" : ""
                              }`}
                            />
                            {errors.rating && touched.has("rating") && (
                              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.rating}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-slate-300 mb-1 block">Source</label>
                            <Select value={form.rating_source} onValueChange={(v) => handleFieldChange("rating_source", v)}>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {RATING_SOURCES.map((s) => (
                                  <SelectItem key={s.value} value={s.value} className="text-slate-200">
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-sm text-slate-300 mb-1 block">
                            Notes <span className="text-slate-500 text-xs">(optional)</span>
                          </label>
                          <Textarea
                            placeholder="Anything captains should know (roles, availability, etc.)..."
                            value={form.notes}
                            onChange={(e) => handleFieldChange("notes", e.target.value)}
                            onBlur={() => handleBlur("notes")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 resize-none ${
                              errors.notes && touched.has("notes") ? "border-red-500/50" : ""
                            }`}
                            rows={3}
                          />
                          <div className="flex justify-between mt-1">
                            {errors.notes && touched.has("notes") ? (
                              <p className="text-red-400 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.notes}
                              </p>
                            ) : (
                              <span />
                            )}
                            <span className="text-xs text-slate-500">{form.notes.length}/500</span>
                          </div>
                        </div>

                        {submitError && (
                          <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            {submitError}
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={handleReviewClick}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Review Registration <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step: Confirm */}
                {step === "confirm" && (
                  <Card className="bg-slate-800/50 border-blue-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">Confirm Registration</CardTitle>
                      <p className="text-slate-400 text-xs">Please review your details before submitting.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                        <ConfirmRow label="Discord" value={form.discord_id} />
                        <ConfirmRow label="In-Game Name" value={form.display_name} />
                        {form.steam_id && <ConfirmRow label="Steam ID" value={form.steam_id} />}
                        {form.rating && (
                          <ConfirmRow
                            label="MMR"
                            value={`${parseInt(form.rating, 10).toLocaleString()}${form.rating_source ? ` (${RATING_SOURCES.find((s) => s.value === form.rating_source)?.label})` : ""}`}
                          />
                        )}
                        {form.notes && <ConfirmRow label="Notes" value={form.notes} />}
                      </div>

                      {submitError && (
                        <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          {submitError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("form")}
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {submitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                          ) : (
                            "Confirm & Register"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step: Success */}
                {step === "success" && (
                  <Card className="bg-slate-800/50 border-green-500/30">
                    <CardContent className="py-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">You're Registered!</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          You've been added to the player pool for this event. 
                          Captains will be able to see your profile during the draft.
                          Check Discord for updates.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          className="bg-[#5865F2] hover:bg-[#4752C4] text-white w-full"
                          asChild
                        >
                          <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Join Discord
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
                          onClick={handleRegisterAnother}
                        >
                          Register Another Player
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
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

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-slate-500 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-slate-200 text-right break-words">{value}</span>
    </div>
  )
}
