"use server"

import { redirect } from "next/navigation"

export type AdminLoginState = { ok?: boolean; message?: string } | null

export async function adminPasswordLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "")

  // Previous method: grant access when password is exactly '8800'
  if (password === "8800") {
    // No persistent auth or gating; just navigate to the dashboard.
    redirect("/admin/dashboard")
  }

  return { ok: false, message: "Incorrect password." }
}
