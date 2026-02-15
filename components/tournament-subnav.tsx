"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/tournament", label: "Overview" },
  { href: "/tournament/schedule", label: "Schedule" },
  { href: "/tournament/teams", label: "Teams" },
  { href: "/tournament/rules", label: "Rules" },
  { href: "/tournament/info", label: "Info" },
  { href: "/tournament/faqs", label: "FAQs" },
]

export function TournamentSubnav() {
  const pathname = usePathname()

  return (
    <nav className="w-full border-b bg-white">
      <div className="container px-4 md:px-6">
        <ul className="flex flex-wrap gap-2 py-3">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "inline-block rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[#aa5a35] text-white"
                      : "text-[#aa5a35] hover:bg-[#aa5a35]/10"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
