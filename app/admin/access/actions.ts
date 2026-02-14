'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type ActionState = { error?: string }

// Password: 88008800
export async function accessAction(prevState: ActionState | undefined, formData: FormData): Promise<ActionState | void> {
  const password = (formData.get('password') || '').toString().trim()

  if (password === '88008800') {
    // Issue an httpOnly cookie for 8 hours
    cookies().set('admin_access', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    redirect('/admin/dashboard')
  }

  return { error: 'Incorrect password. Please try again.' }
}
