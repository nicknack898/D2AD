"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Gavel,
  Eye,
  KeyRound,
  Clock,
  CheckCircle2,
  Radio,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Starting Soon", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  active: { label: "Live Now", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Radio },
  paused: { label: "Paused", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Clock },
  completed: { label: "Completed", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
}

export default function DraftListClient() {
  const router = useRouter()
  const { data, isLoading } = useSWR("/api/draft/list", fetcher, { refreshInterval: 10000 })
  const sessions = data?.data ?? []

  const [code, setCode] = useState("")
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState(false)

  const liveSessions = sessions.filter((s: any) => s.status === "active" || s.status === "paused")
  const upcomingSessions = sessions.filter((s: any) => s.status === "pending")
  const pastSessions = sessions.filter((s: any) => s.status === "completed")

  const handleCodeRedeem = useCallback(async () => {
    if (!code.trim()) return
    setCodeLoading(true)
    setCodeError(null)
    setCodeSuccess(false)

    try {
      // Try to redeem code against each non-completed session
      const activeSessions = sessions.filter((s: any) => s.status !== "completed")

      if (activeSessions.length === 0) {
        setCodeError("No active draft sessions found")
        setCodeLoading(false)
        return
      }

      for (const sess of activeSessions) {
        const res = await fetch(`/api/draft/${sess.id}/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim().toUpperCase() }),
        })

        if (res.ok) {
          setCodeSuccess(true)
          setTimeout(() => {
            router.push(`/draft/${sess.id}`)
          }, 800)
          return
        }

        const respData = await res.json()
        if (res.status === 409) {
          setCodeError(respData.error ?? "This code has already been used")
          setCodeLoading(false)
          return
        }
        // 404 means wrong code for this session, try next
      }

      setCodeError("Invalid code. Please check and try again.")
    } catch {
      setCodeError("Network error, please try again")
    } finally {
      if (!codeSuccess) setCodeLoading(false)
    }
  }, [code, sessions, router, codeSuccess])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-slate-700/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <Gavel className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-bebas tracking-wide">
            Draft Room
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Watch live captain auctions or enter your captain code to bid on players for your team.
          </p>
        </div>

        {/* Captain Code Entry */}
        <Card className="bg-slate-800/60 border-blue-500/20 border mb-10">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <KeyRound className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Have a captain code?</p>
                <p className="text-slate-400 text-xs">Enter your one-time code to join the draft as a captain.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter your captain code (e.g. A1B2C3D4)"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(null); setCodeSuccess(false) }}
                onKeyDown={(e) => e.key === "Enter" && handleCodeRedeem()}
                className="bg-slate-900 border-slate-600 text-white font-mono text-center text-lg tracking-widest uppercase flex-1 placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                maxLength={20}
              />
              <Button
                onClick={handleCodeRedeem}
                disabled={codeLoading || !code.trim() || codeSuccess}
                className={`px-6 shrink-0 transition-all ${
                  codeSuccess
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {codeSuccess ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Authenticated</>
                ) : codeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><KeyRound className="h-4 w-4 mr-2" /> Enter Draft</>
                )}
              </Button>
            </div>

            {codeError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-3 bg-red-400/5 rounded-lg px-3 py-2 border border-red-500/10">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}
            {codeSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-sm mt-3 bg-green-400/5 rounded-lg px-3 py-2 border border-green-500/10">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Code accepted! Redirecting to draft room...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading draft sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Gavel className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No draft sessions yet</p>
              <p className="text-slate-500 text-sm">
                Draft sessions are created by admins when an event is ready. Check back soon or join our Discord for announcements.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Live Sessions */}
            {liveSessions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-bebas tracking-wide flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  Live Now
                </h2>
                <div className="grid gap-4">
                  {liveSessions.map((s: any) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-bebas tracking-wide">Starting Soon</h2>
                <div className="grid gap-4">
                  {upcomingSessions.map((s: any) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-bebas tracking-wide">Completed</h2>
                <div className="grid gap-4">
                  {pastSessions.map((s: any) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session }: { session: any }) {
  const st = statusConfig[session.status] ?? statusConfig.pending
  const Icon = st.icon
  const isLive = session.status === "active"

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${isLive ? "border-green-500/40 ring-1 ring-green-500/20" : ""} transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${st.color}`}>
              <Icon className="h-3 w-3" />
              {st.label}
            </span>
            <CardTitle className="text-white text-lg">{session.event_name || "Draft Session"}</CardTitle>
          </div>
          <span className="text-xs text-slate-500">
            {new Date(session.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{session.captain_count ?? "?"} captains</span>
            <span>{session.seconds_per_lot ?? 30}s per lot</span>
          </div>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" asChild>
            <Link href={`/draft/${session.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {session.status === "completed" ? "View Results" : isLive ? "Watch Live" : "Open Draft Room"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
