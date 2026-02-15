"use client"

import { useState, useEffect } from "react"
import { createClientForBrowser } from "@/lib/supabase-auth"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientForBrowser()
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return {
    user,
    isLoading,
    signOut,
  }
}
