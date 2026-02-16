"use client"

import * as React from "react"
import { useActionState } from "react"
import { accessAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

type ActionState = { error?: string }

export default function AdminAccessPage() {
  const [state, formAction, pending] = useActionState(accessAction, {} as ActionState)

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <Image
              src="/ability-draft-logo.png"
              alt="D2AD Logo"
              width={48}
              height={48}
              className="mx-auto mb-4 rounded-lg"
            />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
              <h1 className="font-bebas text-2xl tracking-wide text-slate-100">Admin Access</h1>
            </div>
            <p className="text-sm text-slate-400">Enter the admin password to continue.</p>
          </div>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                placeholder="Enter admin password"
                autoFocus
                aria-invalid={!!state?.error}
                aria-describedby={state?.error ? "password-error" : undefined}
              />
              {state?.error && (
                <p id="password-error" className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {state.error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
          </form>
        </div>
      </div>
    </main>
  )
}
