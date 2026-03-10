import type { DraftConfigInput } from "@/lib/validation"
import { draftConfigSchema } from "@/lib/validation"

export interface DraftPlayerSeed {
  id: string
  rating: number | null
}

export interface DraftPlayerLotSeed extends DraftPlayerSeed {
  phase: "phase1" | "phase2"
  min_bid: number
  lot_order: number
  seeded_value: number
}

const DEFAULT_CONFIG = draftConfigSchema.parse({})

function roundToStep(value: number, step: number): number {
  if (step <= 1) return Math.round(value)
  return Math.max(step, Math.round(value / step) * step)
}

export function parseDraftConfig(input: unknown): DraftConfigInput {
  const parsed = draftConfigSchema.safeParse(input)
  if (!parsed.success) return DEFAULT_CONFIG
  return parsed.data
}

export function computeSeedValue(rating: number | null, config: DraftConfigInput): number {
  const rawRating = rating ?? config.rating.baseline
  const converted = config.rating.base_value + ((rawRating - config.rating.baseline) * config.rating.points_per_rating)
  return Math.max(1, roundToStep(converted, config.rating.round_to))
}

export function classifyLotsByPhase(players: DraftPlayerSeed[], config: DraftConfigInput): DraftPlayerLotSeed[] {
  const withValue = players
    .map((p) => ({ ...p, seeded_value: computeSeedValue(p.rating, config) }))
    .sort((a, b) => b.seeded_value - a.seeded_value)

  const totalPlayers = withValue.length
  let phase1Count = config.phase1.selection.mode === "top_n"
    ? config.phase1.selection.top_n
    : Math.ceil(totalPlayers * (config.phase1.selection.percentage / 100))

  phase1Count = Math.max(0, Math.min(totalPlayers, phase1Count))

  const phase1 = withValue.slice(0, phase1Count).map((player) => ({
    ...player,
    phase: "phase1" as const,
    min_bid: Math.max(1, Math.ceil(player.seeded_value * (config.phase1.min_bid_pct / 100))),
  }))

  const phase2 = withValue.slice(phase1Count).map((player) => ({
    ...player,
    phase: "phase2" as const,
    min_bid: Math.max(1, config.phase2.min_bid),
  }))

  return [...phase1, ...phase2]
    .sort((a, b) => {
      if (a.phase === b.phase) return b.seeded_value - a.seeded_value
      return a.phase === "phase1" ? -1 : 1
    })
    .map((entry, idx) => ({
      ...entry,
      lot_order: idx + 1,
    }))
}
