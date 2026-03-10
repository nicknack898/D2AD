"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export function useProfileCompletion() {
  const { user, isLoading: authLoading } = useAuth()
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkProfileCompletion() {
      if (!user) {
        setIsLoading(false)
        return
      }

      if (!supabase) {
        setIsLoading(false)
        return
      }

      try {
        // Check if player exists with this auth_id
        const { data: player, error } = await supabase.from("players").select("*").eq("email", user.email).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error checking profile:", error)
          setIsLoading(false)
          return
        }

        if (!player) {
          setIsProfileComplete(false)
          setIsLoading(false)
          return
        }

        // Check if profile is complete
        setIsProfileComplete(player.profile_completed || false)
        setIsLoading(false)
      } catch (error) {
        console.error("Error in profile check:", error)
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      checkProfileCompletion()
    }
  }, [user, authLoading, router])

  const redirectToProfileCompletion = () => {
    if (!isProfileComplete && !isLoading && !authLoading && user) {
      router.push("/profile/complete")
    }
  }

  return {
    isProfileComplete,
    isLoading: isLoading || authLoading,
    redirectToProfileCompletion,
  }
}
