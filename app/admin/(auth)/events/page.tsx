"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Pencil, Trash2, ExternalLink, Users } from "lucide-react"
import Link from "next/link"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "registration_open", label: "Registration Open" },
  { value: "registration_closed", label: "Registration Closed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  status: "draft",
  registration_opens_at: "",
  registration_closes_at: "",
  starts_at: "",
}

export default function AdminEventsPage() {
  const { data, isLoading } = useSWR("/api/events", fetcher)
  const events = data?.data ?? []

  const [open, setOpen] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function openCreate() {
    setForm({ ...defaultForm })
    setEditingSlug(null)
    setError("")
    setOpen(true)
  }

  function openEdit(event: any) {
    setForm({
      name: event.name,
      slug: event.slug,
      description: event.description || "",
      status: event.status,
      registration_opens_at: event.registration_opens_at?.slice(0, 16) || "",
      registration_closes_at: event.registration_closes_at?.slice(0, 16) || "",
      starts_at: event.starts_at?.slice(0, 16) || "",
    })
    setEditingSlug(event.slug)
    setError("")
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const body = {
      ...form,
      registration_opens_at: form.registration_opens_at ? new Date(form.registration_opens_at).toISOString() : null,
      registration_closes_at: form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    }

    try {
      const url = editingSlug ? `/api/events/${editingSlug}` : "/api/events"
      const method = editingSlug ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.message || json.error || "Failed to save event")
        return
      }

      mutate("/api/events")
      setOpen(false)
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return

    await fetch(`/api/events/${slug}`, { method: "DELETE" })
    mutate("/api/events")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage league events.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSlug ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Name *</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingSlug ? form.slug : slugify(e.target.value),
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Slug *</label>
                <Input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  disabled={!!editingSlug}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Reg Opens</label>
                  <Input
                    type="datetime-local"
                    value={form.registration_opens_at}
                    onChange={(e) => setForm({ ...form, registration_opens_at: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Reg Closes</label>
                  <Input
                    type="datetime-local"
                    value={form.registration_closes_at}
                    onChange={(e) => setForm({ ...form, registration_closes_at: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Starts At</label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingSlug ? "Update Event" : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : events.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">No events yet. Create your first event to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <Card key={event.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold truncate">{event.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                        event.status === "registration_open"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : event.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }`}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === event.status)?.label ?? event.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">/{event.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/player-pool?event=${event.slug}`}>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/events/${event.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => openEdit(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(event.slug)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
