"use client"

import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { accessAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

type ActionState = { error?: string; success?: boolean }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-wider uppercase rounded-none h-11"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        "Login"
      )}
    </Button>
  )
}

export default function AdminAccessPage() {
  const router = useRouter()
  const [state, setState] = useState<ActionState>({})
  useEffect(() => {
    if (state.success) {
      router.push("/admin")
    }
  }, [state.success, router])

  async function handleSubmit(formData: FormData) {
    const result = await accessAction(undefined, formData)
    setState(result)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="border border-border p-8">
          <div className="text-center mb-8">
            <Image
              src="/ability-draft-logo.png"
              alt="D2AD Logo"
              width={48}
              height={48}
              className="mx-auto mb-6 opacity-90"
            />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h1 className="font-bebas text-2xl tracking-wide text-foreground">Admin Access</h1>
            </div>
            <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
              Enter your admin credentials to continue
            </p>
          </div>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block font-mono text-xs tracking-wider uppercase text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 rounded-none h-11"
                placeholder="admin@example.com"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block font-mono text-xs tracking-wider uppercase text-muted-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 rounded-none h-11"
                placeholder="Enter admin password"
                aria-invalid={!!state?.error}
                aria-describedby={state?.error ? "password-error" : undefined}
              />
              {state?.error && (
                <p id="password-error" className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {state.error}
                </p>
              )}
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}
