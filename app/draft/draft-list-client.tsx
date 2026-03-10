"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  lobby: { label: "STARTING SOON", color: "text-muted-foreground border-border", icon: Clock },
  picking: { label: "LIVE", color: "text-emerald-400 border-emerald-400/30", icon: Radio },
  paused: { label: "PAUSED", color: "text-muted-foreground border-border", icon: Clock },
  finished: { label: "ENDED", color: "text-muted-foreground border-border", icon: CheckCircle2 },
}

export default function DraftListClient() {
  const router = useRouter()
  const { data, isLoading } = useSWR("/api/draft/list", fetcher, { refreshInterval: 10000 })
  const sessions = data?.data ?? []

  const [code, setCode] = useState("")
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState(false)

  const liveSessions = sessions.filter((s: any) => s.phase === "picking" || s.phase === "paused")
  const upcomingSessions = sessions.filter((s: any) => s.phase === "lobby")
  const pastSessions = sessions.filter((s: any) => s.phase === "finished")

  const handleCodeRedeem = useCallback(async () => {
    if (!code.trim()) return
    setCodeLoading(true)
    setCodeError(null)
    setCodeSuccess(false)

    try {
      const activeSessions = sessions.filter((s: any) => s.phase !== "finished")
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
          setTimeout(() => router.push(`/draft/${sess.id}`), 800)
          return
        }

        const respData = await res.json()
        if (res.status === 409) {
          setCodeError(respData.error ?? "This code has already been used")
          setCodeLoading(false)
          return
        }
      }

      setCodeError("Invalid code. Please check and try again.")
    } catch {
      setCodeError("Network error, please try again")
    } finally {
      if (!codeSuccess) setCodeLoading(false)
    }
  }, [code, sessions, router, codeSuccess])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Auction
          </p>
          <h1 className="text-4xl md:text-6xl font-bebas tracking-wide text-foreground mb-3">
            Draft Room
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Watch live captain auctions or enter your captain code to bid on players for your team.
          </p>
        </div>

        {/* Captain Code Entry */}
        <div className="border border-border p-6 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-foreground text-sm font-medium">Have a captain code?</p>
              <p className="text-muted-foreground text-xs">Enter your one-time code to join the draft.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter your captain code (e.g. A1B2C3D4)"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(null); setCodeSuccess(false) }}
              onKeyDown={(e) => e.key === "Enter" && handleCodeRedeem()}
              className="bg-background border-border text-foreground font-mono text-center text-lg tracking-widest uppercase flex-1 placeholder:text-muted-foreground/40 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans rounded-none"
              maxLength={20}
            />
            <Button
              onClick={handleCodeRedeem}
              disabled={codeLoading || !code.trim() || codeSuccess}
              className={`px-6 shrink-0 rounded-none font-mono text-xs tracking-wider uppercase h-10 ${
                codeSuccess
                  ? "bg-emerald-600 hover:bg-emerald-600 text-foreground"
                  : "bg-foreground text-background hover:bg-foreground/90"
              }`}
            >
              {codeSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Authenticated
                </>
              ) : codeLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5 mr-2" /> Enter Draft
                </>
              )}
            </Button>
          </div>

          {codeError && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-3 font-mono text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{codeError}</span>
            </div>
          )}
          {codeSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm mt-3 font-mono text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Code accepted. Redirecting...</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="border border-border py-16 flex flex-col items-center justify-center">
            <Gavel className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-mono text-sm">No draft sessions yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Draft sessions are created when an event is ready.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Live Sessions */}
            {liveSessions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-emerald-400">
                    Live Now
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {liveSessions.map((s: any) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcomingSessions.length > 0 && (
              <section>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  Starting Soon
                </p>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {upcomingSessions.map((s: any) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {pastSessions.length > 0 && (
              <section>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  Completed
                </p>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {pastSessions.map((s: any) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionRow({ session }: { session: any }) {
  const st = statusConfig[session.phase] ?? statusConfig.lobby
  const Icon = st.icon
  const isLive = session.phase === "picking"

  return (
    <Link
      href={`/draft/${session.id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 px-1 hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`font-mono text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5 flex items-center gap-1.5 ${st.color}`}>
            <Icon className="h-2.5 w-2.5" />
            {st.label}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            {new Date(session.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className={`text-lg font-bebas tracking-wide transition-colors truncate ${
          isLive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        }`}>
          {session.event_name || "Draft Session"}
        </h3>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground">
          {session.captain_count ?? "?"} captains
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {session.seconds_per_lot ?? 30}s/lot
        </span>
        <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {session.phase === "finished" ? "Results" : isLive ? "Watch" : "Open"}
        </span>
      </div>
    </Link>
  )
}
