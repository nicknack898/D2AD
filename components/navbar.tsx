"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/ability-draft-logo.png" alt="D2AD Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-white">D2AD</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-slate-300 hover:text-white transition-colors duration-200">
              Events
            </Link>
            <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors duration-200">
              Discord
            </Link>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
              asChild
            >
              <Link href="/events">
                <MessageCircle className="mr-2 h-4 w-4" />
                Register
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu} className="text-slate-300 hover:text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/95 rounded-lg mt-2 border border-slate-700">
              <Link
                href="/events"
                className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="https://discord.gg/d2ad"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Discord
              </Link>
              <div className="px-3 py-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                  asChild
                >
                  <Link href="/events">
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
