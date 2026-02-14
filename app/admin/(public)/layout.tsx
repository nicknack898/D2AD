import type { ReactNode } from "react"

// Public layout for /admin/(public) routes like the login page.
export default function AdminPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[color:var(--background,#f8fafc)] p-4">
      {children}
    </div>
  )
}
