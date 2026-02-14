"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, ArrowRight, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD"
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
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

export default function EventsClient() {
  const { data, isLoading } = useSWR("/api/events", fetcher)
  const events = data?.data ?? []

  const active = events.filter((e: any) => !["completed", "cancelled"].includes(e.status))
  const past = events.filter((e: any) => ["completed", "cancelled"].includes(e.status))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-bebas tracking-wide mb-2">Events</h1>
          <p className="text-slate-400 leading-relaxed">
            Browse upcoming leagues and events. Register to join the player pool and get drafted.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl text-slate-300 mb-2">No events yet</h3>
              <p className="text-slate-500 mb-6">
                Events are announced on our Discord first. Join to stay in the loop.
              </p>
              <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
                <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join Discord
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active / Upcoming */}
            {active.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6 font-teko tracking-wide uppercase">
                  Active & Upcoming
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {active.map((event: any) => {
                    const st = statusLabels[event.status] ?? statusLabels.draft
                    return (
                      <Link key={event.id} href={`/events/${event.slug}`}>
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full border ${st.color}`}>
                                {st.label}
                              </span>
                            </div>
                            <CardTitle className="text-white text-2xl">{event.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {event.description && (
                              <p className="text-slate-400 text-sm line-clamp-3">{event.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
                              {event.event_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(event.event_date)}
                                </span>
                              )}
                              {event.registration_closes_at && event.status === "registration_open" && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  Reg closes {formatDate(event.registration_closes_at)}
                                </span>
                              )}
                            </div>
                            <div className="pt-2">
                              <span className="text-blue-400 text-sm flex items-center gap-1">
                                View details <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-6 font-teko tracking-wide uppercase">
                  Past Events
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {past.map((event: any) => {
                    const st = statusLabels[event.status] ?? statusLabels.completed
                    return (
                      <Link key={event.id} href={`/events/${event.slug}`}>
                        <Card className="bg-slate-800/30 border-slate-700/50 hover:border-slate-600 transition-colors h-full">
                          <CardHeader className="pb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border w-fit ${st.color}`}>
                              {st.label}
                            </span>
                            <CardTitle className="text-slate-300 text-lg mt-2">{event.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <span className="text-xs text-slate-500">{formatDate(event.event_date)}</span>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
