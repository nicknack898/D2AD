import Link from "next/link"
import Image from "next/image"
import { MessageCircle, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image src="/ability-draft-logo.png" alt="D2AD Logo" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-white">D2AD</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              The grassroots platform for competitive Dota 2 Ability Draft. Events, drafts, and community.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <div className="space-y-2">
              <Link href="/events" className="block text-slate-400 hover:text-white transition-colors duration-200">
                Events
              </Link>
              <Link href="/draft" className="block text-slate-400 hover:text-white transition-colors duration-200">
                Draft Room
              </Link>
              <Link
                href="https://discord.gg/d2ad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-slate-400 hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Discord
              </Link>
            </div>
          </div>

          {/* Join Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get Involved</h3>
            <p className="text-slate-400">Sign up for events, get drafted by captains, and compete.</p>
            <Link
              href="/events"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2025 D2AD. Built with <Heart className="inline h-4 w-4 text-red-500" /> by the community.
            </p>
            <p className="text-slate-500 text-sm">Grassroots Ability Draft</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
