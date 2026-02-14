import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Auth is handled in Server Components (layouts/pages). Do not gate in middleware.
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Add a conservative CSP in production
  // Allow Supabase Realtime WebSocket connections for the Draft Room
  if (process.env.NODE_ENV === "production") {
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : "*.supabase.co"
    response.headers.set(
      "Content-Security-Policy",
      `default-src 'self'; connect-src 'self' https://${supabaseHost} wss://${supabaseHost}; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;`
    )
  }

  return response
}

export const config = {
  matcher: ["/(.*)"],
}
