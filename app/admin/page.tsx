import { redirect } from "next/navigation"
import { verifyAdminSessionCookie } from "@/lib/auth"

export default async function AdminIndex() {
  const session = await verifyAdminSessionCookie()

  if (!session.valid || session.payload?.role !== "admin") {
    redirect("/admin/access")
  }

  redirect("/admin/dashboard")
}
