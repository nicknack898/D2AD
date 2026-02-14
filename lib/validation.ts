import { z } from "zod"

export const registrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required").max(50, "Team name must be less than 50 characters"),
  captainName: z.string().min(1, "Captain name is required").max(50, "Captain name must be less than 50 characters"),
  captainEmail: z.string().email("Invalid email address"),
  captainPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  player2Name: z.string().min(1, "Player 2 name is required").max(50, "Player name must be less than 50 characters"),
  player3Name: z.string().min(1, "Player 3 name is required").max(50, "Player name must be less than 50 characters"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(10, "Emergency phone must be at least 10 digits"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

export const bookingInputSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  teamId: z.string().min(1, "Team ID is required"),
  userId: z.string().min(1, "User ID is required"),
})

export const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  steamId: z.string().optional(),
  preferredRole: z.string().optional(),
})

export const teamRegistrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required").max(50, "Team name must be less than 50 characters"),
  captainName: z.string().min(1, "Captain name is required").max(50, "Captain name must be less than 50 characters"),
  captainEmail: z.string().email("Invalid email address"),
  captainPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  captainSteamId: z.string().optional(),
  players: z.array(z.object({
    name: z.string().min(1, "Player name is required"),
    steamId: z.string().optional(),
    role: z.string().optional(),
  })).min(2, "At least 2 additional players are required").max(6, "Maximum 6 additional players"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type BookingInput = z.infer<typeof bookingInputSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>
