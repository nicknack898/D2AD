import { SignJWT, jwtVerify, type JWTPayload } from "jose"

/**
 * Captain JWT – lightweight token issued when a captain redeems
 * their one-time code. Stored in an httpOnly cookie called `captain_token`.
 *
 * Payload: { seat_id, session_id, label }
 */

export interface CaptainPayload extends JWTPayload {
  seat_id: string
  session_id: string
  label: string
}

function getSecret() {
  const raw = process.env.CAPTAIN_JWT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!raw) throw new Error("CAPTAIN_JWT_SECRET is not configured")
  return new TextEncoder().encode(raw)
}

export async function signCaptainToken(payload: Omit<CaptainPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret())
}

export async function verifyCaptainToken(token: string): Promise<CaptainPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as CaptainPayload
}
