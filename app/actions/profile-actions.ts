"use server"

import { createClient } from "@/lib/supabase-server"
import { profileSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function updatePlayerProfile(formData: FormData) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: "Authentication required" }
    }

    // Parse and validate form data
    const rawData = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      emergency_contact: formData.get("emergency_contact") as string,
      emergency_phone: formData.get("emergency_phone") as string,
      skill_level: formData.get("skill_level") as string,
      preferred_position: formData.get("preferred_position") as string,
      medical_conditions: formData.get("medical_conditions") as string,
      dietary_restrictions: formData.get("dietary_restrictions") as string,
    }

    const validatedData = profileSchema.parse(rawData)

    // Update profile in database
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...validatedData,
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
    const supabase = createClient()

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
