-- Ensure draft rule configuration columns are available for application logic.
BEGIN;

ALTER TABLE draft_sessions
  ADD COLUMN IF NOT EXISTS config_json jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'phase1';

ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS min_bid numeric NOT NULL DEFAULT 1;

COMMIT;
