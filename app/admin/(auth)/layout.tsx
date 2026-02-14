import type { ReactNode } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"

// Public admin layout: no authentication gate.
// The admin panel remains accessible to everyone.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
