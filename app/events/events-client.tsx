"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Users, ArrowRight, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusLabels: Record<string, { label: string; color: string }> = {
  registration_open: { label: "OPEN", color: "text-emerald-400 border-emerald-400/30" },
  registration_closed: { label: "CLOSED", color: "text-muted-foreground border-border" },
  in_progress: { label: "LIVE", color: "text-emerald-400 border-emerald-400/30" },
  completed: { label: "ENDED", color: "text-muted-foreground border-border" },
  draft: { label: "SOON", color: "text-muted-foreground border-border" },
  cancelled: { label: "CANCELLED", color: "text-destructive border-destructive/30" },
}

export default function EventsClient() {
  const { data, isLoading } = useSWR("/api/events", fetcher)
  const events = data?.data ?? []

  const active = events.filter((e: any) => !["completed", "cancelled"].includes(e.status))
  const past = events.filter((e: any) => ["completed", "cancelled"].includes(e.status))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Schedule
          </p>
          <h1 className="text-4xl md:text-6xl font-bebas tracking-wide text-foreground">Events</h1>
          <p className="text-muted-foreground leading-relaxed mt-3 max-w-lg">
            Browse upcoming leagues and events. Register to join the player pool and get drafted.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="border border-border py-16 flex flex-col items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-mono text-sm">No events yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1 mb-6">
              Events are announced on Discord first.
            </p>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-wider uppercase rounded-none h-10 px-6"
              asChild
            >
              <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                Join Discord
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Active / Upcoming */}
            {active.length > 0 && (
              <section>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  Active & Upcoming
                </p>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {active.map((event: any) => {
                    const st = statusLabels[event.status] ?? statusLabels.draft
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 sm:py-6 px-1 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className={`font-mono text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5 ${st.color}`}
                            >
                              {st.label}
                            </span>
                            {event.starts_at && (
                              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                                {formatDate(event.starts_at)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bebas tracking-wide text-foreground group-hover:text-foreground/80 transition-colors truncate">
                            {event.name}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {event.player_count > 0 && (
                            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                              <Users className="h-3 w-3" />
                              {event.player_count}
                            </span>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  Completed
                </p>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {past.map((event: any) => {
                    const st = statusLabels[event.status] ?? statusLabels.completed
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 px-1 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5 shrink-0 ${st.color}`}
                          >
                            {st.label}
                          </span>
                          <h3 className="text-base font-bebas tracking-wide text-muted-foreground group-hover:text-foreground transition-colors truncate">
                            {event.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {formatDate(event.starts_at)}
                          </span>
                          {event.player_count > 0 && (
                            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" /> {event.player_count}
                            </span>
                          )}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
