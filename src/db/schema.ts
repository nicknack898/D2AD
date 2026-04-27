import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

export const seasonStatusEnum = pgEnum("season_status", ["draft", "active", "complete"])
export const auctionStatusEnum = pgEnum("auction_status", [
  "lobby",
  "ready",
  "nominating",
  "bidding",
  "round_break",
  "complete",
])
export const roleEnum = pgEnum("role", ["carry", "mid", "off", "pos4", "pos5"])
export const eventTypeEnum = pgEnum("auction_event_type", [
  "state_changed",
  "bid_placed",
  "nomination_started",
  "player_sold",
  "timer_reset",
  "redrawn",
])

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull().default("D2AD"),
  seasonLabel: varchar("season", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  status: seasonStatusEnum("status").notNull().default("draft"),
  purseStarting: integer("purse_starting").notNull().default(558),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    steamId: varchar("steam_id", { length: 32 }),
    username: varchar("username", { length: 64 }).notNull(),
    mmr: integer("mmr").notNull(),
    willingToDraft: integer("willing_to_draft").notNull().default(0),
    teamOrganizer: integer("team_organizer").notNull().default(0),
    bio: text("bio"),
    available: boolean("available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    steamIdIdx: uniqueIndex("players_steam_id_idx").on(table.steamId),
  }),
)

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  stars: integer("stars").notNull(),
})

export const captains = pgTable("captains", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  purseStarting: integer("purse_starting").notNull().default(558),
  mmr: integer("mmr").notNull(),
})

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  status: auctionStatusEnum("status").notNull().default("lobby"),
  currentNominatorId: integer("current_nominator_id").references(() => captains.id),
  currentPlayerId: integer("current_player_id").references(() => players.id),
  topBid: integer("top_bid"),
  topBidderId: integer("top_bidder_id").references(() => captains.id),
  endsAt: timestamp("ends_at", { withTimezone: true }),
})

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),
  captainId: integer("captain_id")
    .notNull()
    .references(() => captains.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const rosters = pgTable("rosters", {
  id: serial("id").primaryKey(),
  captainId: integer("captain_id")
    .notNull()
    .references(() => captains.id, { onDelete: "cascade" }),
  slot: integer("slot").notNull(),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  wonFor: integer("won_for").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),
  type: eventTypeEnum("type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
})

export type AuctionStatus = (typeof auctionStatusEnum.enumValues)[number]
export type Role = (typeof roleEnum.enumValues)[number]
