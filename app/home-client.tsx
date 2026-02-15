"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Zap, Trophy, Calendar, ArrowRight, Clock, Shield } from "lucide-react"
import Image from "next/image"
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
  registration_open: { label: "Registration Open", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  registration_closed: { label: "Registration Closed", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  draft: { label: "Coming Soon", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function HomeClient() {
  const { data: eventsRes } = useSWR("/api/events", fetcher)
  const events = eventsRes?.data ?? []

  const upcomingEvents = events.filter(
    (e: any) => e.status !== "completed" && e.status !== "cancelled"
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-4xl mx-auto">
          <Image
            src="/ability-draft-logo.png"
            alt="D2AD Community Logo"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight font-bebas tracking-wide">
            D2AD
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-2 font-teko tracking-wide uppercase">
            Dota 2 Ability Draft League
          </p>
          <p className="text-base md:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            The grassroots platform for competitive Ability Draft. Sign up for events, get drafted by captains, and
            prove yourself in the arena.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                View Events
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Discord
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-bebas tracking-wide">Upcoming Events</h2>
            <Link
              href="/events"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No upcoming events yet.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Join our Discord to be the first to know when new events are announced.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => {
                const st = statusLabels[event.status] ?? statusLabels.draft
                return (
                  <Link key={event.id} href={`/events/${event.slug}`}>
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${st.color}`}
                          >
                            {st.label}
                          </span>
                          {event.starts_at && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(event.starts_at)}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-white text-xl">{event.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-400 text-sm line-clamp-2">
                          {event.description || "Details coming soon."}
                        </p>
                        {event.player_count > 0 && (
                          <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.player_count} player{event.player_count !== 1 ? "s" : ""} registered
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 font-bebas tracking-wide">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "1. Sign Up",
                desc: "Register for an event with your Discord username and in-game name.",
                color: "text-blue-400",
              },
              {
                icon: Shield,
                title: "2. Get Drafted",
                desc: "Captains bid on players in our live auction Draft Room.",
                color: "text-green-400",
              },
              {
                icon: Zap,
                title: "3. Draft Abilities",
                desc: "Your team enters Ability Draft and picks the perfect combo.",
                color: "text-yellow-400",
              },
              {
                icon: Trophy,
                title: "4. Compete",
                desc: "Play matches, climb the standings, and prove your worth.",
                color: "text-purple-400",
              },
            ].map((step) => (
              <div key={step.title} className="text-center space-y-3">
                <div className="bg-slate-700/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discord CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-bebas tracking-wide">
            Join the Community
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            All event announcements, captain coordination, and post-game discussions happen on Discord. It is the
            heartbeat of D2AD.
          </p>
          <Button
            size="lg"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-5 text-lg font-semibold"
            asChild
          >
            <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Join Our Discord
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
