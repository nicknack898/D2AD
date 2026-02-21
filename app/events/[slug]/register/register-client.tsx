"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Gamepad2,
  Hash,
  MessageCircle,
  Users,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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

const STEPS = [
  { key: "identity", label: "Identity" },
  { key: "details", label: "Details" },
  { key: "review", label: "Review" },
] as const

function validateStep1(form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!form.discord_id.trim()) errors.discord_id = "Discord username is required"
  else if (form.discord_id.length > 50) errors.discord_id = "Too long (max 50)"
  if (!form.display_name.trim()) errors.display_name = "In-game name is required"
  else if (form.display_name.length > 50) errors.display_name = "Too long (max 50)"
  return errors
}

function validateStep2(form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (form.steam_id && form.steam_id.length > 50) errors.steam_id = "Too long (max 50)"
  if (form.rating) {
    const r = parseInt(form.rating, 10)
    if (isNaN(r) || r < 0) errors.rating = "Must be a positive number"
    else if (r > 15000) errors.rating = "That seems too high (max 15000)"
  }
  if (form.notes && form.notes.length > 500) errors.notes = "Max 500 characters"
  return errors
}

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  if (days > 0) return `${days}d ${hours}h left`
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours}h ${minutes}m left`
}

export default function RegisterClient({ slug }: { slug: string }) {
  const router = useRouter()
  const { data: eventRes, isLoading } = useSWR(`/api/events/${slug}`, fetcher)
  const { data: playersRes } = useSWR(`/api/events/${slug}/players?status=confirmed`, fetcher)
  const event = eventRes?.data
  const playerCount = playersRes?.data?.length ?? 0

  const [step, setStep] = useState(0) // 0=identity, 1=details, 2=review
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // Scroll to top on step change
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [step, success])

  function handleFieldChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (touched.has(field)) {
      const newForm = { ...form, [field]: value }
      const step1Errors = validateStep1(newForm)
      const step2Errors = validateStep2(newForm)
      setErrors((prev) => ({ ...prev, [field]: { ...step1Errors, ...step2Errors }[field] }))
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched((prev) => new Set(prev).add(field))
    const step1Errors = validateStep1(form)
    const step2Errors = validateStep2(form)
    setErrors((prev) => ({ ...prev, [field]: { ...step1Errors, ...step2Errors }[field] }))
  }

  function nextStep() {
    if (step === 0) {
      setTouched(new Set(["discord_id", "display_name"]))
      const errs = validateStep1(form)
      setErrors(errs)
      if (Object.keys(errs).length === 0) setStep(1)
    } else if (step === 1) {
      setTouched(new Set([...touched, "steam_id", "rating", "notes"]))
      const errs = validateStep2(form)
      setErrors(errs)
      if (Object.keys(errs).length === 0) setStep(2)
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
        setSuccess(true)
      } else {
        setSubmitError(json.message || json.error || "Registration failed. Please try again.")
      }
    } catch {
      setSubmitError("Network error. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl text-foreground mb-4">Event not found</h1>
          <Button variant="outline" className="text-foreground/80 border-border" asChild>
            <Link href="/events"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOpen = event.status === "registration_open"
  const regDeadline = event.registration_closes_at ? timeUntil(event.registration_closes_at) : null

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="bg-card border-border max-w-md w-full">
          <CardContent className="py-10 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground/60 mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Registration Closed</h1>
            <p className="text-muted-foreground text-sm">
              {event.status === "draft"
                ? "Registration has not opened yet for this event."
                : "Registration is currently closed for this event."}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="border-border text-foreground/80" asChild>
                <Link href={`/events/${slug}`}><ArrowLeft className="mr-2 h-4 w-4" /> Event Details</Link>
              </Button>
              <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-foreground" asChild>
                <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Get Notified on Discord
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-none bg-green-500/20 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h1 className="text-3xl font-bold text-foreground font-bebas tracking-wide">{"You're In!"}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {"You've been added to the player pool for"}{" "}
              <span className="text-foreground font-medium">{event.name}</span>.
              Captains will be able to see your profile during the draft.
            </p>
          </div>
          <Card className="bg-card/50 border-border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {form.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium text-sm">{form.display_name}</p>
                    <p className="text-muted-foreground/60 text-xs">{form.discord_id}</p>
                  </div>
                </div>
                {form.rating && (
                  <span className="text-sm text-muted-foreground tabular-nums">{parseInt(form.rating).toLocaleString()} MMR</span>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-foreground w-full" asChild>
              <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Join Discord for Updates
              </Link>
            </Button>
            <Button variant="outline" className="border-border text-foreground/80 hover:bg-card w-full" asChild>
              <Link href={`/events/${slug}`}>View Event Details</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> {event.name}
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
            {regDeadline && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Clock className="h-3 w-3" /> {regDeadline}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {playerCount}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8" ref={formRef}>
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Registration Open
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-bebas tracking-wide mb-2">
            Join the Player Pool
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Register for <span className="text-foreground">{event.name}</span> and get drafted by a captain.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => {
                  if (i < step) setStep(i)
                }}
                disabled={i > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium transition-all ${
                  i === step
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : i < step
                      ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer hover:bg-green-500/20"
                      : "bg-card text-muted-foreground/60 border border-border"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="w-4 h-4 rounded-none bg-current/20 flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${i < step ? "bg-green-500/30" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === 0 && (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Who are you?</h2>
                <p className="text-muted-foreground text-sm">
                  Enter your Discord username and in-game name so captains can find you.
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Discord Username"
                  required
                  icon={<Hash className="h-4 w-4" />}
                  placeholder="e.g. player#1234"
                  value={form.discord_id}
                  onChange={(v) => handleFieldChange("discord_id", v)}
                  onBlur={() => handleBlur("discord_id")}
                  error={touched.has("discord_id") ? errors.discord_id : undefined}
                />

                <FormField
                  label="In-Game Name"
                  required
                  icon={<Gamepad2 className="h-4 w-4" />}
                  placeholder="Your Dota 2 display name"
                  value={form.display_name}
                  onChange={(v) => handleFieldChange("display_name", v)}
                  onBlur={() => handleBlur("display_name")}
                  error={touched.has("display_name") ? errors.display_name : undefined}
                />
              </div>

              <Button onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-foreground">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Player Details</h2>
                <p className="text-muted-foreground text-sm">
                  Optional info to help captains during the draft. All fields are optional.
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Steam ID"
                  placeholder="e.g. 76561198012345678"
                  value={form.steam_id}
                  onChange={(v) => handleFieldChange("steam_id", v)}
                  onBlur={() => handleBlur("steam_id")}
                  error={touched.has("steam_id") ? errors.steam_id : undefined}
                  hint="Your Steam64 ID for stat lookups"
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Estimated MMR"
                    type="number"
                    placeholder="e.g. 3500"
                    value={form.rating}
                    onChange={(v) => handleFieldChange("rating", v)}
                    onBlur={() => handleBlur("rating")}
                    error={touched.has("rating") ? errors.rating : undefined}
                  />
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Source</label>
                    <Select value={form.rating_source} onValueChange={(v) => handleFieldChange("rating_source", v)}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {RATING_SOURCES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-foreground">{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-foreground/80 mb-1.5 block">Notes for Captains</label>
                  <Textarea
                    placeholder="Preferred roles, availability, anything captains should know..."
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    onBlur={() => handleBlur("notes")}
                    className={`bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 resize-none ${
                      touched.has("notes") && errors.notes ? "border-red-500/50" : ""
                    }`}
                    rows={3}
                  />
                  <div className="flex justify-between mt-1">
                    {touched.has("notes") && errors.notes ? (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.notes}
                      </p>
                    ) : <span />}
                    <span className="text-xs text-muted-foreground/60">{form.notes.length}/500</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1 border-border text-foreground/80 hover:bg-muted"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-foreground">
                  Review <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 2 && (
          <Card className="bg-card/50 border-blue-500/20 border">
            <CardContent className="py-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Review & Confirm</h2>
                <p className="text-muted-foreground text-sm">
                  Double-check your details before submitting.
                </p>
              </div>

              <div className="bg-background/60 rounded-none divide-y divide-border">
                <ReviewRow label="Discord" value={form.discord_id} />
                <ReviewRow label="In-Game Name" value={form.display_name} />
                {form.steam_id && <ReviewRow label="Steam ID" value={form.steam_id} />}
                {form.rating && (
                  <ReviewRow
                    label="MMR"
                    value={`${parseInt(form.rating).toLocaleString()}${
                      form.rating_source
                        ? ` (${RATING_SOURCES.find((s) => s.value === form.rating_source)?.label})`
                        : ""
                    }`}
                  />
                )}
                {form.notes && <ReviewRow label="Notes" value={form.notes} />}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 text-sm p-3 rounded-none bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-border text-foreground/80 hover:bg-muted"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-foreground"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Register</>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground/60 text-center">
                By registering, you agree to participate in good faith and follow event rules.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// -- Sub-components --

function FormField({
  label,
  required,
  icon,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  hint,
}: {
  label: string
  required?: boolean
  icon?: React.ReactNode
  placeholder: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  error?: string
  type?: string
  hint?: string
}) {
  return (
    <div>
      <label className="text-sm text-foreground/80 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">{icon}</div>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 ${
            icon ? "pl-9" : ""
          } ${error ? "border-red-500/50" : ""}`}
        />
      </div>
      {error ? (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : hint ? (
        <p className="text-muted-foreground/60 text-xs mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 px-4 py-3">
      <span className="text-xs text-muted-foreground/60 uppercase tracking-wide shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-foreground text-right break-words">{value}</span>
    </div>
  )
}
