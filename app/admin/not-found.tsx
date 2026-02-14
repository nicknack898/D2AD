import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertOctagon, Home } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center">
          <AlertOctagon className="h-8 w-8 text-neutral-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">404 — Page not found</h1>
        <p className="mt-3 text-neutral-600">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/" aria-label="Go to homepage">
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href="https://discord.gg/W6fCSMzzPz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Discord server for support"
            >
              Join Discord
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
