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
              <span className="text-xl font-bold text-white">D2AD Community</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              A grassroots community for passionate Dota 2 Ability Draft players. Built by players, for players.
            </p>
          </div>

          {/* Community Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Community</h3>
            <div className="space-y-2">
              <Link
                href="https://discord.gg/d2ad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-slate-400 hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Discord Server
              </Link>
              <Link href="#about" className="block text-slate-400 hover:text-white transition-colors duration-200">
                About Ability Draft
              </Link>
              <Link href="#faq" className="block text-slate-400 hover:text-white transition-colors duration-200">
                FAQ
              </Link>
            </div>
          </div>

          {/* Join Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Join the Movement</h3>
            <p className="text-slate-400">Connect with fellow AD enthusiasts and improve your game together.</p>
            <Link
              href="https://discord.gg/d2ad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2024 D2AD Community. Built with <Heart className="inline h-4 w-4 text-red-500" /> by the community.
            </p>
            <p className="text-slate-500 text-sm">Quality over quantity • Grassroots movement</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
