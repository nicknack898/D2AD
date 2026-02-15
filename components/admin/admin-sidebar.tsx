"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, Gavel, Calendar, Settings, UserCheck, LogOut, KeyRound } from "lucide-react"
import Image from "next/image"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    badgeKey: null as string | null,
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: Calendar,
    badgeKey: null as string | null,
  },
  {
    title: "Player Pool",
    href: "/admin/player-pool",
    icon: UserCheck,
    badgeKey: "pending_players" as string | null,
  },
  {
    title: "Draft Room",
    href: "/admin/drafts",
    icon: Gavel,
    badgeKey: null as string | null,
  },
  {
    title: "Captain Codes",
    href: "/admin/captain-codes",
    icon: KeyRound,
    badgeKey: null as string | null,
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: Users,
    badgeKey: null as string | null,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badgeKey: null as string | null,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  // Poll for pending player count every 15 seconds
  useEffect(() => {
    let mounted = true
    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setPendingCount(json.pending_players ?? 0)
      } catch {
        // silent
      }
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
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
        <Image src="/ability-draft-logo.png" alt="Ability Draft Logo" width={32} height={32} className="w-8 h-8" />
        <div>
          <h2 className="text-lg font-semibold">D2AD Admin</h2>
          <p className="text-xs text-slate-400">League Management</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const badge = getBadge(item.badgeKey)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-left relative",
                    isActive
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                  {badge != null && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500/20 px-1.5 text-[10px] font-bold text-yellow-400 border border-yellow-500/30">
                      {badge}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <Separator className="bg-slate-700" />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" })
            window.location.href = "/admin/access"
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
