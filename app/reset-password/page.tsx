"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error, success } = await resetPassword(email)

      if (success) {
        setSuccess(true)
      } else if (error) {
        setError(error.message || "Failed to send reset email. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-900 text-white shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="font-bebas text-3xl text-center">RESET PASSWORD</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/20 border-green-900 text-green-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Password reset link sent! Check your email.</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-duck-orange hover:bg-duck-orange/90 text-white font-teko tracking-wide text-lg"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "SENDING..." : "SEND RESET LINK"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <Button variant="link" asChild className="text-duck-orange hover:text-duck-orange/80">
              <Link href="/login">Back to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
