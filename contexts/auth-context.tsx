"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClientForBrowser } from "@/lib/supabase-auth"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    success: boolean
  }>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    success: boolean
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  signInWithOAuth: (provider: 'google' | 'discord') => Promise<{
    error: Error | null
    success: boolean
  }>
  sendMagicLink: (email: string) => Promise<{
    error: Error | null
    success: boolean
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientForBrowser()

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        setIsLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    setData()

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  async function signInWithOAuth(provider: 'google' | 'discord') {
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            // Optional: to force re-consent in some providers
            prompt: 'consent'
          }
        }
      })

      return { error: error ?? null, success: !error }
    } catch (error) {
      return { error: error as Error, success: false }
    }
  }

  async function sendMagicLink(email: string) {
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true
        }
      })

      return { error: error ?? null, success: !error }
    } catch (error) {
      return { error: error as Error, success: false }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithOAuth,
    sendMagicLink
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
