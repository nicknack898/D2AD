import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get("admin_access")?.value === "1"

  if (!isAuthed) {
    redirect("/admin/access")
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
