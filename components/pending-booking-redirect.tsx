"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProfileCompletion } from "@/hooks/use-profile-completion"

export default function PendingBookingRedirect() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isProfileComplete, isLoading: profileCheckLoading } = useProfileCompletion()

  useEffect(() => {
    // Check if there's a pending booking after profile completion
    if (!authLoading && !profileCheckLoading && user && isProfileComplete) {
      const pendingBookingGameId = sessionStorage.getItem("pendingBookingGameId")

      if (pendingBookingGameId) {
        // Clear the pending booking
        sessionStorage.removeItem("pendingBookingGameId")
        // Redirect to the game booking page
        router.push(`/games/${pendingBookingGameId}`)
      }
    }
  }, [authLoading, profileCheckLoading, user, isProfileComplete, router])

  return null
}
