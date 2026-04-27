import Link from "next/link"

const links = [
  { href: "/auctions", label: "Auctions" },
  { href: "/auctions/admin", label: "Admin" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/auctions" className="text-lg font-semibold tracking-wide text-white">
          D2AD · Auctions
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-200">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
