"use client"

import { Button } from "@/components/ui/button"
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
  registration_open: { label: "OPEN", color: "text-emerald-400 border-emerald-400/30" },
  registration_closed: { label: "CLOSED", color: "text-muted-foreground border-border" },
  in_progress: { label: "LIVE", color: "text-emerald-400 border-emerald-400/30" },
  completed: { label: "ENDED", color: "text-muted-foreground border-border" },
  draft: { label: "SOON", color: "text-muted-foreground border-border" },
  cancelled: { label: "CANCELLED", color: "text-destructive border-destructive/30" },
}

export default function HomeClient() {
  const { data: eventsRes } = useSWR("/api/events", fetcher)
  const events = eventsRes?.data ?? []

  const upcomingEvents = events
    .filter((e: any) => e.status !== "completed" && e.status !== "cancelled")
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 md:pt-36 md:pb-28">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(0 0% 14%) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto">
          <Image
            src="/ability-draft-logo.png"
            alt="D2AD Community Logo"
            width={80}
            height={80}
            className="mb-8 opacity-90"
            priority
          />

          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Dota 2 Ability Draft League
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bebas tracking-wide text-foreground leading-none text-balance">
            Compete at the
            <br />
            highest level.
          </h1>

          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
            The grassroots platform for competitive Ability Draft. Sign up for events, get drafted by captains, and
            prove yourself in the arena.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-mono text-sm tracking-wider uppercase px-8 h-12 rounded-none"
              asChild
            >
              <Link href="/events">
                View Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted font-mono text-sm tracking-wider uppercase px-8 h-12 rounded-none"
              asChild
            >
              <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Discord
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </section>

      {/* ─── UPCOMING EVENTS ─── */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Schedule
              </p>
              <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-foreground">
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden sm:flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              All events <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="border border-border py-16 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-mono text-sm">No upcoming events</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Join Discord to be first to know.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border border-t border-b border-border">
              {upcomingEvents.map((event: any) => {
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
          )}

          <Link
            href="/events"
            className="sm:hidden flex items-center justify-center gap-1.5 font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors mt-6"
          >
            All events <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-4 py-16 md:py-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2 text-center">
            Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-foreground text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {[
              {
                icon: Users,
                step: "01",
                title: "Sign Up",
                desc: "Register for an event with your Discord username and in-game name.",
              },
              {
                icon: Shield,
                step: "02",
                title: "Get Drafted",
                desc: "Captains bid on players in our live auction Draft Room.",
              },
              {
                icon: Zap,
                step: "03",
                title: "Draft Abilities",
                desc: "Your team enters Ability Draft and picks the perfect combo.",
              },
              {
                icon: Trophy,
                step: "04",
                title: "Compete",
                desc: "Play matches, climb the standings, and prove your worth.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="bg-background p-6 md:p-8 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs text-muted-foreground">{step.step}</span>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bebas tracking-wide text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCORD CTA ─── */}
      <section className="px-4 py-20 md:py-28 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Community
          </p>
          <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-foreground mb-4 text-balance">
            Join the conversation
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
            All event announcements, captain coordination, and post-game discussions happen on Discord. It is the
            heartbeat of D2AD.
          </p>
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 font-mono text-sm tracking-wider uppercase px-10 h-12 rounded-none"
            asChild
          >
            <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
