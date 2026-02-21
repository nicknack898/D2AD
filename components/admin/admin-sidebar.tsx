"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Users, Gavel, Calendar, Settings, UserCheck, LogOut, KeyRound } from "lucide-react"
import Image from "next/image"

const sidebarNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, badgeKey: null as string | null },
  { title: "Events", href: "/admin/events", icon: Calendar, badgeKey: null as string | null },
  { title: "Player Pool", href: "/admin/player-pool", icon: UserCheck, badgeKey: "pending_players" as string | null },
  { title: "Draft Room", href: "/admin/drafts", icon: Gavel, badgeKey: null as string | null },
  { title: "Captain Codes", href: "/admin/captain-codes", icon: KeyRound, badgeKey: null as string | null },
  { title: "Teams", href: "/admin/teams", icon: Users, badgeKey: null as string | null },
  { title: "Settings", href: "/admin/settings", icon: Settings, badgeKey: null as string | null },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let mounted = true
    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setPendingCount(json.pending_players ?? 0)
      } catch { /* silent */ }
    }
    fetchPending()
    const interval = setInterval(fetchPending, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  function getBadge(key: string | null) {
    if (key === "pending_players" && pendingCount > 0) return pendingCount
    return null
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-6">
        <Image src="/ability-draft-logo.png" alt="D2AD Logo" width={28} height={28} className="opacity-90" />
        <div>
          <h2 className="font-bebas text-lg tracking-wider text-foreground">D2AD</h2>
          <p className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const badge = getBadge(item.badgeKey)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-left relative rounded-none h-9 font-mono text-xs tracking-wider",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.title}
                  {badge != null && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center font-mono text-[9px] text-emerald-400 border border-emerald-400/30 px-1">
                      {badge}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted hover:text-foreground rounded-none h-9 font-mono text-xs tracking-wider"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" })
            window.location.href = "/admin/access"
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
