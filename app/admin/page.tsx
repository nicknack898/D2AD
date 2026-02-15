import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminIndex() {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get("admin_access")?.value === "1"

  if (!isAuthed) {
    redirect("/admin/access")
  }

  redirect("/admin/dashboard")
}
