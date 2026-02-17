"use server"

import { cookies, headers } from "next/headers"
import crypto from "crypto"

const ADMIN_ACCESS_ENABLED = true

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@abilitydraft.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "8800"

// Session signing secret for cookie integrity
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-me-session-secret"
const SESSION_COOKIE = "admin-session"
const SESSION_MAX_AGE_SEC = 60 * 60 * 2 // 2 hours

type LoginResult = {
  success: boolean
  message: string
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

function sign(payload: object) {
  const body = base64Url(JSON.stringify(payload))
  const sig = base64Url(crypto.createHmac("sha256", SESSION_SECRET).update(body).digest())
  return `${body}.${sig}`
}

function verify(token: string): { valid: boolean; payload?: any } {
  const [body, sig] = token.split(".")
  if (!body || !sig) return { valid: false }
  const expected = base64Url(crypto.createHmac("sha256", SESSION_SECRET).update(body).digest())
  if (expected !== sig) return { valid: false }
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"))
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.exp === "number" && now > payload.exp) return { valid: false }
    return { valid: true, payload }
  } catch {
    return { valid: false }
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (!ADMIN_ACCESS_ENABLED) {
    return { success: false, message: "Admin access is currently disabled." }
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

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Issue signed session token
    const nowSec = Math.floor(Date.now() / 1000)
    const token = sign({ iat: nowSec, exp: nowSec + SESSION_MAX_AGE_SEC, sub: "admin" })

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
  if (!ADMIN_ACCESS_ENABLED) return false
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return false
  const { valid } = verify(token)
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
  const ok = await isAuthenticated()
  if (!ok) {
    // dynamic import to avoid pulling NextResponse into server-action contexts
    const { NextResponse } = await import("next/server")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
