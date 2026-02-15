import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

function getSQL() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export const sql: ReturnType<typeof neon> = new Proxy(
  function () {} as unknown as ReturnType<typeof neon>,
  {
    apply(_target, thisArg, args) {
      return Reflect.apply(getSQL(), thisArg, args)
    },
    get(_target, prop, receiver) {
      if (prop === Symbol.toPrimitive || prop === "toString" || prop === "valueOf") {
        return Reflect.get(getSQL(), prop, receiver)
      }
      return Reflect.get(getSQL(), prop, receiver)
    },
  },
)

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
