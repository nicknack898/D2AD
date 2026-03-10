import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"

const ADMIN_ACCESS_ENABLED = true
const SESSION_COOKIE = "admin-session"
const SESSION_MAX_AGE_SEC = 60 * 60 * 2 // 2 hours

type RequiredAdminEnv = "ADMIN_EMAIL" | "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET"

function getRequiredEnv(name: RequiredAdminEnv) {
  const value = process.env[name]
  if (!value) {
    return null
  }
  return value
}

function getAdminConfig() {
  const email = getRequiredEnv("ADMIN_EMAIL")
  const password = getRequiredEnv("ADMIN_PASSWORD")
  const sessionSecret = getRequiredEnv("ADMIN_SESSION_SECRET")

  if (!email || !password || !sessionSecret) {
    return null
  }

  return {
    email,
    password,
    sessionSecret,
  }
}

type LoginResult = {
  success: boolean
  message: string
}

type AdminSessionPayload = {
  iat: number
  exp: number
  sub: string
  role: "admin"
}

// Simple in-memory rate limit: { key -> { count, lastAttempt } }
const attempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function getClientIp(): string {
  const hdrs = headers()
  const xff = hdrs.get("x-forwarded-for") || ""
  const xri = hdrs.get("x-real-ip") || ""
  const ip = xff.split(",")[0].trim() || xri || "unknown"
  return ip
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function sign(payload: AdminSessionPayload) {
  const config = getAdminConfig()
  if (!config) return null

  const body = base64Url(JSON.stringify(payload))
  const sig = base64Url(crypto.createHmac("sha256", config.sessionSecret).update(body).digest())
  return `${body}.${sig}`
}

function parsePayload(body: string): AdminSessionPayload | null {
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"))
    if (
      typeof payload?.iat !== "number" ||
      typeof payload?.exp !== "number" ||
      payload?.sub !== "admin" ||
      payload?.role !== "admin"
    ) {
      return null
    }

    return payload as AdminSessionPayload
  } catch {
    return null
  }
}

export function verifyAdminSessionToken(token: string): { valid: boolean; payload?: AdminSessionPayload } {
  const config = getAdminConfig()
  if (!config) return { valid: false }

  const [body, sig] = token.split(".")
  if (!body || !sig) return { valid: false }

  const expected = base64Url(crypto.createHmac("sha256", config.sessionSecret).update(body).digest())
  if (expected !== sig) return { valid: false }

  const payload = parsePayload(body)
  if (!payload) return { valid: false }

  const now = Math.floor(Date.now() / 1000)
  if (now > payload.exp) return { valid: false }

  return { valid: true, payload }
}

export async function verifyAdminSessionCookie() {
  if (!ADMIN_ACCESS_ENABLED) return { valid: false as const }

  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return { valid: false as const }

  return verifyAdminSessionToken(token)
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (!ADMIN_ACCESS_ENABLED) {
    return { success: false, message: "Admin access is currently disabled." }
  }

  const config = getAdminConfig()
  if (!config) {
    return { success: false, message: "Admin auth is not configured on this environment." }
  }

  if (!email || !password) {
    return { success: false, message: "Email and password are required" }
  }

  // Rate limiting by IP + email
  const key = crypto.createHash("sha256").update(`${getClientIp()}|${email.toLowerCase()}`).digest("hex")
  const now = Date.now()
  const record = attempts.get(key)

  if (record) {
    if (record.count >= MAX_ATTEMPTS) {
      const elapsed = now - record.lastAttempt
      if (elapsed < LOCKOUT_MS) {
        const minutes = Math.ceil((LOCKOUT_MS - elapsed) / 60000)
        return { success: false, message: `Too many failed attempts. Try again in ${minutes}m.` }
      } else {
        attempts.set(key, { count: 1, lastAttempt: now })
      }
    } else {
      record.count += 1
      record.lastAttempt = now
      attempts.set(key, record)
    }
  } else {
    attempts.set(key, { count: 1, lastAttempt: now })
  }

  if (email === config.email && password === config.password) {
    // Issue signed session token
    const nowSec = Math.floor(Date.now() / 1000)
    const token = sign({ iat: nowSec, exp: nowSec + SESSION_MAX_AGE_SEC, sub: "admin", role: "admin" })
    if (!token) {
      return { success: false, message: "Admin auth is not configured on this environment." }
    }

    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_SEC,
      path: "/",
    })

    attempts.delete(key)
    return { success: true, message: "Login successful" }
  }

  return { success: false, message: "Invalid email or password" }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE)
}

export async function isAuthenticated() {
  const { valid } = await verifyAdminSessionCookie()
  return valid
}

export async function requireAuth() {
  const ok = await isAuthenticated()
  if (!ok) {
    // Do not redirect here to keep function side-effect free for Next.js;
    // instead, callers should handle redirect based on return value.
    return false
  }
  return true
}

/**
 * Guard for API Route Handlers.
 * Returns a 401 NextResponse when the caller is NOT a signed-in admin,
 * or `null` when authenticated -- so callers can do:
 *
 *   const denied = await requireAdminApi()
 *   if (denied) return denied
 */
export async function requireAdminApi() {
  const session = await verifyAdminSessionCookie()

  if (!session.valid || session.payload?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}
