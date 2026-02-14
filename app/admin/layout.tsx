import type { ReactNode } from "react"

// Root admin layout: just a passthrough. Auth is handled in (auth)/layout.tsx.
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
