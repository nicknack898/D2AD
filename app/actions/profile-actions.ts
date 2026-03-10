"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

type ProfileUpdateInput = {
  name: string
  email: string
  phone: string
  area: string
  areaOther: string
  timePreferences: string[]
  dayPreferences: string[]
  skillLevel: string
}

export async function updatePlayerProfile(formData: ProfileUpdateInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: "Authentication required" }
    }

    // Update profile in database
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      area: formData.area,
      area_other: formData.areaOther || null,
      time_preferences: formData.timePreferences,
      day_preferences: formData.dayPreferences,
      skill_level: formData.skillLevel,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Profile update error:", error)
      return { success: false, message: "Failed to update profile" }
    }

    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile action error:", error)
    return { success: false, message: "Invalid profile data" }
  }
}

export async function getPlayerProfile(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Get profile error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get profile action error:", error)
    return null
  }
}
