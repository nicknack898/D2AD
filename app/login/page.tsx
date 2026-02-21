"use client"

import { useState } from "react"
import { createClientForBrowser } from "@/lib/supabase-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Mail, MessageCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const supabase = createClientForBrowser()

  const handleOAuth = async (provider: "google" | "discord") => {
    setIsLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : {},
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setError(error.message || `Failed to sign in with ${provider}. Please try again.`)
    } catch (err) {
      console.error("OAuth error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message || "Failed to send magic link.")
      else alert("Check your email for the sign-in link.")
    } catch (err) {
      console.error("Magic link error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card text-foreground shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/ability-draft-logo.png"
                alt="Ability Draft Logo"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </div>
            <CardTitle className="font-bebas text-3xl text-center">ABILITY DRAFT</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to join the tournament and compete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => handleOAuth("google")}
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-3 px-4 flex items-center justify-center gap-3"
                aria-label="Sign in with Google"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
                {!isLoading && (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleOAuth("discord")}
                disabled={isLoading}
                className="w-full bg-[#5865F2] hover:bg-[#4854c2] text-white font-medium py-3 px-4 flex items-center justify-center gap-3"
                aria-label="Sign in with Discord"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Continue with Discord
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-center text-muted-foreground text-sm">Or sign in via magic link</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-none border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <Button onClick={handleMagicLink} disabled={isLoading || !email} aria-label="Send magic link">
                  <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                  Send Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
