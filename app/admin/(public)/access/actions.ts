'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type ActionState = { error?: string }

export async function accessAction(prevState: ActionState | undefined, formData: FormData): Promise<ActionState | void> {
  const password = (formData.get('password') || '').toString().trim()

  if (password === (process.env.ADMIN_PASSWORD || 'd2ad')) {
    // Issue an httpOnly cookie for 8 hours
    ;(await cookies()).set('admin_access', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    redirect('/admin')
  }

  return { error: 'Incorrect password. Please try again.' }
}
