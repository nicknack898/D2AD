"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Gavel, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ events: 0, players: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [evRes, draftRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/draft/list"),
        ])
        const evData = await evRes.json()
        const draftData = await draftRes.json()
        const events = evData.data ?? []
        const drafts = draftData.data ?? []
        setStats({
          events: events.length,
          players: 0,
          drafts: drafts.length,
        })
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 font-bebas tracking-wide">Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome to the D2AD admin panel.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{loading ? "-" : stats.events}</p>
              <p className="text-sm text-slate-400">Events</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{loading ? "-" : stats.players}</p>
              <p className="text-sm text-slate-400">Players</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Gavel className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{loading ? "-" : stats.drafts}</p>
              <p className="text-sm text-slate-400">Draft Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/events" className="group">
          <Card className="bg-slate-800/60 border-slate-700 hover:border-blue-500/30 transition-colors">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-slate-200 font-medium">Manage Events</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/drafts" className="group">
          <Card className="bg-slate-800/60 border-slate-700 hover:border-yellow-500/30 transition-colors">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gavel className="h-5 w-5 text-yellow-400" />
                <span className="text-slate-200 font-medium">Draft Room</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-yellow-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/player-pool" className="group">
          <Card className="bg-slate-800/60 border-slate-700 hover:border-green-500/30 transition-colors">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-slate-200 font-medium">Player Pool</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-green-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
