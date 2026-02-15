import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

function getSQL(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required")
  }
  return neon(process.env.DATABASE_URL)
}

export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return getSQL()(...(args as [TemplateStringsArray, ...any[]]))
  },
  get(_target, prop) {
    return (getSQL() as any)[prop]
  },
})

export interface TeamRegistration {
  id: number
  team_name: string
  contact_email: string
  contact_discord?: string
  contact_steam?: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  team_id: number
  player_name: string
  steam_id: string
  is_captain: boolean
  created_at: string
}

export interface TeamRegistrationWithMembers extends TeamRegistration {
  members: TeamMember[]
}
