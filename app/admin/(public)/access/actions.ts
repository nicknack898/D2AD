'use server'

import { cookies } from 'next/headers'

type ActionState = { error?: string; success?: boolean }

export async function accessAction(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const password = (formData.get('password') || '').toString().trim()

  if (password === (process.env.ADMIN_PASSWORD || 'd2ad')) {
    // Issue an httpOnly cookie for 8 hours
    cookies().set('admin_access', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return { success: true }
  }

  return { error: 'Incorrect password. Please try again.' }
}
