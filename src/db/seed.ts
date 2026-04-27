import { getDb, schema } from "./index"

const fakePlayers = [
  ["76561198000000001", "ArcWardenMain", 6100],
  ["76561198000000002", "TreePuncher", 5200],
  ["76561198000000003", "RuneSniper", 5700],
  ["76561198000000004", "DustBuyer", 4900],
  ["76561198000000005", "WardLord", 4500],
  ["76561198000000006", "SmokeCaller", 5300],
  ["76561198000000007", "LotusEnjoyer", 4800],
  ["76561198000000008", "BKBLate", 5600],
  ["76561198000000009", "RoshanTimer", 6000],
  ["76561198000000010", "ZipZap", 5100],
] as const

async function main() {
  const db = getDb()

  const [league] = await db
    .insert(schema.leagues)
    .values({
      name: "D2AD",
      seasonLabel: "Season 1",
    })
    .returning()

  const [season] = await db
    .insert(schema.seasons)
    .values({
      leagueId: league.id,
      startsAt: new Date(),
      status: "draft",
      purseStarting: 558,
    })
    .returning()

  const insertedPlayers = await db
    .insert(schema.players)
    .values(
      fakePlayers.map(([steamId, username, mmr], i) => ({
        steamId,
        username,
        mmr,
        willingToDraft: (i % 5) + 1,
        teamOrganizer: ((i + 2) % 5) + 1,
        bio: `${username} is ready for D2AD auctions.`,
      })),
    )
    .returning()

  for (const player of insertedPlayers) {
    await db.insert(schema.positions).values([
      { playerId: player.id, role: "carry", stars: Math.max(1, (player.id % 5) + 1) },
      { playerId: player.id, role: "mid", stars: Math.max(1, ((player.id + 1) % 5) + 1) },
      { playerId: player.id, role: "off", stars: Math.max(1, ((player.id + 2) % 5) + 1) },
      { playerId: player.id, role: "pos4", stars: Math.max(1, ((player.id + 3) % 5) + 1) },
      { playerId: player.id, role: "pos5", stars: Math.max(1, ((player.id + 4) % 5) + 1) },
    ])
  }

  const captainPlayers = insertedPlayers.slice(0, 4)
  await db.insert(schema.captains).values(
    captainPlayers.map((player) => ({
      seasonId: season.id,
      playerId: player.id,
      purseStarting: 558,
      mmr: player.mmr,
    })),
  )

  await db.insert(schema.auctions).values({
    seasonId: season.id,
    status: "lobby",
  })

  console.log("Seed complete")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
