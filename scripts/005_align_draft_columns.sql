-- Align draft table columns with application code expectations
-- The code uses different column names than the original migration.
-- This script adds missing columns to make the code work.

BEGIN;

-- draft_sessions: code uses "phase" and "seconds_per_lot"
-- DB has "status" and "current_phase". Add the columns the code needs.
ALTER TABLE draft_sessions ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'lobby';
ALTER TABLE draft_sessions ADD COLUMN IF NOT EXISTS seconds_per_lot integer NOT NULL DEFAULT 30;

-- captain_seats: code uses "captain_name" and "budget"
ALTER TABLE captain_seats ADD COLUMN IF NOT EXISTS captain_name text NOT NULL DEFAULT '';
ALTER TABLE captain_seats ADD COLUMN IF NOT EXISTS budget numeric NOT NULL DEFAULT 1000;

-- wallets: code uses "balance" instead of "remaining_budget"
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 1000;

-- lots: code uses "upcoming" status, "winning_seat_id", "winning_price", "opened_at", "closed_at"
-- DB has "sold_to_seat_id", "sold_price", "started_at", "ended_at"
ALTER TABLE lots ADD COLUMN IF NOT EXISTS winning_seat_id uuid REFERENCES captain_seats(id);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS winning_price numeric;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Drop the status CHECK constraint on lots so we can use "upcoming"
ALTER TABLE lots DROP CONSTRAINT IF EXISTS lots_status_check;
ALTER TABLE lots ADD CONSTRAINT lots_status_check CHECK (status IN ('pending','upcoming','active','sold','unsold','relisted'));

-- captain_codes: code uses plain "code" and "used" boolean instead of "code_hash" and "redeemed_at"
ALTER TABLE captain_codes ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE captain_codes ADD COLUMN IF NOT EXISTS used boolean NOT NULL DEFAULT false;
ALTER TABLE captain_codes ADD COLUMN IF NOT EXISTS used_at timestamptz;

COMMIT;
