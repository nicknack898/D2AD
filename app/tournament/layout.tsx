import type { ReactNode } from "react"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { TournamentSubnav } from "@/components/tournament-subnav"

export default function TournamentLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen">
      <div className="bg-[#aa5a35] text-foreground py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bebas tracking-wide">ABILITY DRAFT TOURNAMENT</h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-foreground border-foreground hover:bg-foreground/20 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <TournamentSubnav />
      <div className="container px-4 md:px-6 py-8">
        <Suspense>{children}</Suspense>
      </div>
    </section>
  )
}
