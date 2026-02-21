"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Gavel, Shield, Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/ability-draft-logo.png" alt="D2AD Logo" width={28} height={28} className="rounded" />
            <span className="font-bebas text-lg tracking-wider text-foreground">D2AD</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/events"
              className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Events
            </Link>
            <Link
              href="/draft"
              className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Gavel className="h-3 w-3" />
              Draft
            </Link>
            <Link
              href="https://discord.gg/d2ad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Discord
            </Link>
            <Link
              href="/admin"
              className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1"
            >
              <Shield className="h-2.5 w-2.5" />
              Admin
            </Link>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-wider uppercase rounded-none h-8 px-4"
              asChild
            >
              <Link href="/events">Register</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 flex flex-col gap-1">
              <Link
                href="/events"
                className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground px-2 py-3 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/draft"
                className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground px-2 py-3 transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gavel className="h-3 w-3" />
                Draft Room
              </Link>
              <Link
                href="https://discord.gg/d2ad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground px-2 py-3 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Discord
              </Link>
              <Link
                href="/admin"
                className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/60 hover:text-muted-foreground px-2 py-3 transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
              <div className="pt-2 px-2">
                <Button
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-wider uppercase rounded-none h-10"
                  asChild
                >
                  <Link href="/events" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
