-- Canonical draft schema normalization migration.
-- This migration converts legacy draft columns to the canonical schema used
-- by lib/draft-engine.ts and draft API routes.

BEGIN;

-- ---------- draft_sessions ----------
ALTER TABLE draft_sessions
  ADD COLUMN IF NOT EXISTS phase text,
  ADD COLUMN IF NOT EXISTS seconds_per_lot integer,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill canonical phase from legacy status/current_phase when needed.
UPDATE draft_sessions
SET phase = CASE
  WHEN phase IN ('lobby','picking','paused','finished') THEN phase
  WHEN status IN ('setup') THEN 'lobby'
  WHEN status IN ('live') THEN 'picking'
  WHEN status IN ('paused') THEN 'paused'
  WHEN status IN ('completed') THEN 'finished'
  ELSE 'lobby'
END
WHERE phase IS NULL
   OR phase NOT IN ('lobby','picking','paused','finished');

UPDATE draft_sessions
SET seconds_per_lot = COALESCE(seconds_per_lot, 30)
WHERE seconds_per_lot IS NULL;

ALTER TABLE draft_sessions
  ALTER COLUMN phase SET NOT NULL,
  ALTER COLUMN phase SET DEFAULT 'lobby',
  ALTER COLUMN seconds_per_lot SET NOT NULL,
  ALTER COLUMN seconds_per_lot SET DEFAULT 30;

ALTER TABLE draft_sessions DROP CONSTRAINT IF EXISTS draft_sessions_phase_check;
ALTER TABLE draft_sessions
  ADD CONSTRAINT draft_sessions_phase_check
  CHECK (phase IN ('lobby','picking','paused','finished'));

DROP INDEX IF EXISTS idx_draft_sessions_status;
CREATE INDEX IF NOT EXISTS idx_draft_sessions_phase ON draft_sessions(phase);

-- ---------- captain_seats ----------
ALTER TABLE captain_seats
  ADD COLUMN IF NOT EXISTS captain_name text,
  ADD COLUMN IF NOT EXISTS budget numeric;

UPDATE captain_seats
SET captain_name = COALESCE(NULLIF(trim(captain_name), ''), seat_label, 'Captain')
WHERE captain_name IS NULL
   OR trim(captain_name) = '';

UPDATE captain_seats
SET budget = COALESCE(budget, 1000)
WHERE budget IS NULL;

ALTER TABLE captain_seats
  ALTER COLUMN captain_name SET NOT NULL,
  ALTER COLUMN budget SET NOT NULL;

-- ---------- wallets ----------
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS balance numeric;

UPDATE wallets
SET balance = COALESCE(balance, remaining_budget, starting_budget, 1000)
WHERE balance IS NULL;

ALTER TABLE wallets
  ALTER COLUMN balance SET NOT NULL;

-- ---------- lots ----------
ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS winning_seat_id uuid REFERENCES captain_seats(id),
  ADD COLUMN IF NOT EXISTS winning_price numeric,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Backfill renamed lot fields.
UPDATE lots
SET winning_seat_id = COALESCE(winning_seat_id, sold_to_seat_id),
    winning_price = COALESCE(winning_price, sold_price),
    opened_at = COALESCE(opened_at, started_at),
    closed_at = COALESCE(closed_at, ended_at)
WHERE winning_seat_id IS NULL
   OR winning_price IS NULL
   OR opened_at IS NULL
   OR closed_at IS NULL;

-- Normalize legacy lot statuses to canonical enum values.
UPDATE lots
SET status = CASE
  WHEN status IN ('upcoming','active','sold','unsold') THEN status
  WHEN status IN ('pending','relisted') THEN 'upcoming'
  ELSE 'upcoming'
END;

ALTER TABLE lots DROP CONSTRAINT IF EXISTS lots_status_check;
ALTER TABLE lots
  ADD CONSTRAINT lots_status_check
  CHECK (status IN ('upcoming','active','sold','unsold'));

ALTER TABLE lots
  ALTER COLUMN status SET DEFAULT 'upcoming';

-- ---------- captain_codes ----------
ALTER TABLE captain_codes
  ADD COLUMN IF NOT EXISTS used boolean,
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

UPDATE captain_codes
SET used = COALESCE(used, redeemed_at IS NOT NULL, false)
WHERE used IS NULL;

UPDATE captain_codes
SET used_at = COALESCE(used_at, redeemed_at)
WHERE used_at IS NULL
  AND redeemed_at IS NOT NULL;

ALTER TABLE captain_codes
  ALTER COLUMN used SET NOT NULL,
  ALTER COLUMN used SET DEFAULT false;

-- ---------- updated_at triggers ----------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wallets_updated_at ON wallets;
CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS draft_sessions_updated_at ON draft_sessions;
CREATE TRIGGER draft_sessions_updated_at
  BEFORE UPDATE ON draft_sessions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ---------- remove obsolete compatibility columns ----------
ALTER TABLE lots
  DROP COLUMN IF EXISTS sold_to_seat_id,
  DROP COLUMN IF EXISTS sold_price,
  DROP COLUMN IF EXISTS started_at,
  DROP COLUMN IF EXISTS ended_at,
  DROP COLUMN IF EXISTS phase,
  DROP COLUMN IF EXISTS min_bid;

ALTER TABLE draft_sessions
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS current_phase,
  DROP COLUMN IF EXISTS config_json,
  DROP COLUMN IF EXISTS started_at,
  DROP COLUMN IF EXISTS completed_at;

ALTER TABLE wallets
  DROP COLUMN IF EXISTS starting_budget,
  DROP COLUMN IF EXISTS remaining_budget;

ALTER TABLE captain_codes
  DROP COLUMN IF EXISTS redeemed_at,
  DROP COLUMN IF EXISTS code;

ALTER TABLE captain_seats
  DROP COLUMN IF EXISTS player_id;

COMMIT;
