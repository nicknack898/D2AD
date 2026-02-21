import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, MessageCircle } from "lucide-react"

const DISCORD_URL = "https://discord.gg/W6fCSMzzPz"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-duck-dark flex items-center justify-center px-4">
      <div className="text-center">
        <Image
          src="/ability-draft-logo.png"
          alt="D2AD Logo"
          width={120}
          height={120}
          className="mx-auto mb-8 opacity-80"
        />
        <h1 className="text-6xl font-bebas text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bebas text-foreground mb-4">PAGE NOT FOUND</h2>
        <p className="text-foreground/80 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. Head back to our community hub or join our Discord!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Join Discord
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
