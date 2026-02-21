"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Gavel, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ events: 0, players: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [evRes, draftRes, statsRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/draft/list"),
          fetch("/api/admin/stats"),
        ])
        const evData = await evRes.json()
        const draftData = await draftRes.json()
        const adminStats = await statsRes.json()
        setStats({
          events: (evData.data ?? []).length,
          players: adminStats.total_players ?? 0,
          drafts: (draftData.data ?? []).length,
        })
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: "Events", value: stats.events, icon: Calendar },
    { label: "Players", value: stats.players, icon: Users },
    { label: "Drafts", value: stats.drafts, icon: Gavel },
  ]

  const quickLinks = [
    { label: "Manage Events", href: "/admin/events", icon: Calendar },
    { label: "Draft Room", href: "/admin/drafts", icon: Gavel },
    { label: "Player Pool", href: "/admin/player-pool", icon: Users },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
        Overview
      </p>
      <h1 className="text-3xl font-bebas tracking-wide text-foreground mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border mb-12">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-card p-6 flex items-center gap-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bebas tracking-wide text-foreground">
                  {loading ? "--" : s.value}
                </p>
                <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Links */}
      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Quick Actions
      </p>
      <div className="flex flex-col divide-y divide-border border-t border-b border-border">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between py-4 px-1 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground text-sm">{link.label}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
