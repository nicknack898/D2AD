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
  contact: z.object({
    email: z.string().email("Invalid email address"),
    discord: z.string().optional(),
    steam: z.string().optional(),
  }),
  members: z.array(z.object({
    name: z.string().min(1, "Player name is required"),
    steamId: z.string().min(1, "Steam ID is required"),
    isCaptain: z.boolean().optional(),
  })).min(5, "Exactly 5 players are required").max(5, "Exactly 5 players are required"),
  notes: z.string().optional(),
})

// --- Phase 1: Events & Players ---

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["draft", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"]).default("draft"),
  registration_opens_at: z.string().datetime().optional().nullable(),
  registration_closes_at: z.string().datetime().optional().nullable(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  rules_json: z.any().optional().nullable(),
})

export const playerRegistrationSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  display_name: z.string().min(1, "In-game name is required").max(50, "In-game name too long"),
  discord_id: z.string().min(1, "Discord username is required").max(50, "Discord username too long"),
  steam_id: z.string().max(50, "Steam ID too long").optional().nullable(),
  rating: z.number().int().min(0, "MMR must be positive").max(15000, "MMR seems too high").optional().nullable(),
  rating_source: z.enum(["self_reported", "dotabuff", "opendota", "stratz"]).optional().nullable(),
  notes: z.string().max(500, "Notes too long").optional().nullable(),
})

// --- Phase 2: Draft Room ---

export const redeemCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  session_id: z.string().uuid("Invalid session ID"),
})

export const placeBidSchema = z.object({
  lot_id: z.string().uuid("Invalid lot ID"),
  seat_id: z.string().uuid("Invalid seat ID"),
  amount: z.number().int().min(1, "Bid must be at least 1"),
})

const phase1SelectionSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("top_n"),
    top_n: z.number().int().min(1).max(500),
  }),
  z.object({
    mode: z.literal("percentage"),
    percentage: z.number().min(1).max(100),
  }),
])

export const draftConfigSchema = z.object({
  phase1: z.object({
    selection: phase1SelectionSchema.default({ mode: "top_n", top_n: 20 }),
    min_bid_pct: z.number().min(0).max(200).default(20),
  }).default({ selection: { mode: "top_n", top_n: 20 }, min_bid_pct: 20 }),
  resale: z.object({
    enabled: z.boolean().default(false),
    max_lots: z.number().int().min(1).max(200).default(5),
    min_bid_pct_of_winning: z.number().min(0).max(200).default(100),
  }).default({ enabled: false, max_lots: 5, min_bid_pct_of_winning: 100 }),
  phase2: z.object({
    min_bid: z.number().int().min(1).max(5000).default(10),
  }).default({ min_bid: 10 }),
  rating: z.object({
    baseline: z.number().int().min(0).max(15000).default(3000),
    base_value: z.number().min(0).max(10000).default(10),
    points_per_rating: z.number().min(0.01).max(100).default(0.02),
    round_to: z.number().int().min(1).max(100).default(1),
  }).default({ baseline: 3000, base_value: 10, points_per_rating: 0.02, round_to: 1 }),
})

export const createDraftSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  seconds_per_lot: z.number().int().min(5).max(300).default(30),
  captain_count: z.number().int().min(2).max(12).default(2),
  budget_per_captain: z.number().int().min(10).max(10000).default(1000),
  config: draftConfigSchema.default({
    phase1: { selection: { mode: "top_n", top_n: 20 }, min_bid_pct: 20 },
    resale: { enabled: false, max_lots: 5, min_bid_pct_of_winning: 100 },
    phase2: { min_bid: 10 },
    rating: { baseline: 3000, base_value: 10, points_per_rating: 0.02, round_to: 1 },
  }),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type BookingInput = z.infer<typeof bookingInputSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>
export type EventInput = z.infer<typeof eventSchema>
export type PlayerRegistrationInput = z.infer<typeof playerRegistrationSchema>
export type RedeemCodeInput = z.infer<typeof redeemCodeSchema>
export type PlaceBidInput = z.infer<typeof placeBidSchema>
export type CreateDraftInput = z.infer<typeof createDraftSchema>
export type DraftConfigInput = z.infer<typeof draftConfigSchema>
