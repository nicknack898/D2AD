import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { verifyAdminSessionCookie } from "@/lib/auth"

export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const session = await verifyAdminSessionCookie()

  if (!session.valid || session.payload?.role !== "admin") {
    redirect("/admin/access")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
