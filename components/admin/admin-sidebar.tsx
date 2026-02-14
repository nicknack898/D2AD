"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, Gamepad2, Calendar, Settings, Trophy, UserCheck, LogOut } from "lucide-react"
import Image from "next/image"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: Users,
  },
  {
    title: "Players",
    href: "/admin/players",
    icon: UserCheck,
  },
  {
    title: "Games",
    href: "/admin/games",
    icon: Gamepad2,
  },
  {
    title: "Schedule",
    href: "/admin/schedule",
    icon: Calendar,
  },
  {
    title: "Tournament",
    href: "/admin/games/manage",
    icon: Trophy,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
        <Image src="/ability-draft-logo.png" alt="Ability Draft Logo" width={32} height={32} className="w-8 h-8" />
        <div>
          <h2 className="text-lg font-semibold">Tournament Admin</h2>
          <p className="text-xs text-slate-400">Ability Draft</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-left",
                    isActive
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
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
          onClick={() => {
            // Handle logout
            window.location.href = "/admin/login"
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
