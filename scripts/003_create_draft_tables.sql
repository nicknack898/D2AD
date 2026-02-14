-- Phase 2: Draft Room tables
-- Creates: draft_sessions, captain_seats, captain_codes, wallets, lots, bids

BEGIN;

-- 1. Draft Sessions
CREATE TABLE IF NOT EXISTS draft_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'setup'
                    CHECK (status IN ('setup','live','paused','completed')),
  current_phase   text NOT NULL DEFAULT 'phase1'
                    CHECK (current_phase IN ('phase1','resale','phase2')),
  current_lot_id  uuid,
  config_json     jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_sessions_event ON draft_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_draft_sessions_status ON draft_sessions(status);

-- 2. Captain Seats
CREATE TABLE IF NOT EXISTS captain_seats (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_session_id  uuid NOT NULL REFERENCES draft_sessions(id) ON DELETE CASCADE,
  seat_label        text NOT NULL,
  player_id         uuid REFERENCES players(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_captain_seats_session ON captain_seats(draft_session_id);

-- 3. Captain Codes (one per seat)
CREATE TABLE IF NOT EXISTS captain_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id       uuid NOT NULL UNIQUE REFERENCES captain_seats(id) ON DELETE CASCADE,
  code_hash     text NOT NULL,
  expires_at    timestamptz NOT NULL,
  redeemed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 4. Wallets (one per seat)
CREATE TABLE IF NOT EXISTS wallets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id           uuid NOT NULL UNIQUE REFERENCES captain_seats(id) ON DELETE CASCADE,
  starting_budget   numeric NOT NULL,
  remaining_budget  numeric NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 5. Lots (ordered auction items)
CREATE TABLE IF NOT EXISTS lots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_session_id  uuid NOT NULL REFERENCES draft_sessions(id) ON DELETE CASCADE,
  player_id         uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  phase             text NOT NULL CHECK (phase IN ('phase1','resale','phase2')),
  lot_order         integer NOT NULL,
  min_bid           numeric NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','active','sold','unsold','relisted')),
  sold_to_seat_id   uuid REFERENCES captain_seats(id),
  sold_price        numeric,
  started_at        timestamptz,
  ended_at          timestamptz,
  UNIQUE(draft_session_id, lot_order)
);

CREATE INDEX IF NOT EXISTS idx_lots_session ON lots(draft_session_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);

-- 6. Bids (immutable ledger)
CREATE TABLE IF NOT EXISTS bids (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id      uuid NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  seat_id     uuid NOT NULL REFERENCES captain_seats(id) ON DELETE CASCADE,
  amount      numeric NOT NULL,
  is_winning  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bids_lot ON bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_seat ON bids(seat_id);

-- Add FK for current_lot_id now that lots table exists
ALTER TABLE draft_sessions
  ADD CONSTRAINT fk_current_lot
  FOREIGN KEY (current_lot_id) REFERENCES lots(id);

-- Updated-at trigger for wallets
CREATE OR REPLACE FUNCTION update_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wallets_updated_at ON wallets;
CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_wallets_updated_at();

COMMIT;
