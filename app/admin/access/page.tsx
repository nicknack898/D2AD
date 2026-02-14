'use client'

import * as React from 'react'
import { accessAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

type ActionState = { error?: string }

export default function AdminAccessPage() {
  const [state, formAction, pending] = React.useActionState<ActionState, FormData>(accessAction, {})

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Shield className="h-6 w-6 text-amber-700" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-amber-600"
                placeholder="Enter password"
                aria-invalid={!!state?.error}
                aria-describedby={state?.error ? 'password-error' : undefined}
              />
              {state?.error ? (
                <p id="password-error" className="mt-2 text-sm text-red-600">
                  {state.error}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#aa5a35] hover:bg-[#8a4a2b]"
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? 'Verifying…' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
