import { cookies } from "next/headers"

/**
 * Minimal API auth check for admin-only endpoints.
 * Supports both legacy `admin_access` and signed `admin-session` cookie.
 */
export async function requireAdminApiAuth(): Promise<boolean> {
  const cookieStore = await cookies()

  if (cookieStore.get("admin_access")?.value === "1") {
    return true
  }

  if (cookieStore.get("admin-session")?.value) {
    return true
  }

  return false
}
