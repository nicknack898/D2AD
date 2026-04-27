# D2AD Auction System (Scaffold Spec)

## Stack choices

- **Runtime/UI:** Next.js App Router + TypeScript + Tailwind + shadcn/ui.
- **Database:** Neon Postgres with Drizzle ORM.
- **Auth:** Auth.js (NextAuth v5) with Discord and Steam (OpenID bridge scaffold).
- **Realtime:** Pusher Channels (planned in Wave 2).

## Wave 1 delivered in this scaffold

1. Drizzle schema + config + seed script.
2. Auth.js root wiring and `/api/auth/[...nextauth]` route.
3. D2AD Auctions route surface at `/auctions` with dedicated header/layout.
4. Auth.js adapter tables (`users`, `accounts`, `sessions`, `verification_tokens`) included in schema + migration.

## Domain entities

Implemented in `src/db/schema.ts`:

- leagues
- seasons
- players
- positions
- captains
- auctions
- bids
- rosters
- events

## Next steps

- Add migrations (`drizzle-kit generate` + `drizzle-kit migrate`).
- Replace Steam provider scaffold with a full OpenID flow validator.
- Implement server-authoritative state machine in `src/lib/auction/state-machine.ts`.
- Add Pusher bridge and `useAuction()` client hook.
- Build auction tables and bidder panes under `app/auctions/[id]`.
