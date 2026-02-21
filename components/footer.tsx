import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Image src="/ability-draft-logo.png" alt="D2AD Logo" width={24} height={24} className="rounded" />
              <span className="font-bebas text-lg tracking-wider text-foreground">D2AD</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The grassroots platform for competitive Dota 2 Ability Draft.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Platform</p>
            <div className="flex flex-col gap-2">
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Events
              </Link>
              <Link href="/draft" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Draft Room
              </Link>
              <Link
                href="https://discord.gg/d2ad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="h-3 w-3" />
                Discord
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Get Involved</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign up for events, get drafted, and compete.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center font-mono text-xs tracking-wider uppercase text-foreground hover:text-muted-foreground transition-colors"
            >
              Browse Events &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/60">
            &copy; 2025 D2AD. Built by the community.
          </p>
          <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/40">
            Grassroots Ability Draft
          </p>
        </div>
      </div>
    </footer>
  )
}
