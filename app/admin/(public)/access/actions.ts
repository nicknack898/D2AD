'use server'

import { login } from '@/lib/auth'

type ActionState = { error?: string; success?: boolean }

export async function accessAction(_prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const email = (formData.get('email') || '').toString().trim().toLowerCase()
  const password = (formData.get('password') || '').toString()

  const result = await login(email, password)

  if (result.success) {
    return { success: true }
  }

  return { error: result.message }
}
