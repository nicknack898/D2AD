-- Create players table for per-event registration
-- Phase 1: Foundation Hub

CREATE TABLE IF NOT EXISTS players (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  display_name    text NOT NULL,
  discord_id      text,
  steam_id        text,
  rating          integer,
  rating_source   text DEFAULT 'self_report'
                    CHECK (rating_source IN ('self_report', 'admin_override', 'opendota', 'internal')),
  status          text NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered', 'confirmed', 'assigned', 'dropped')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Unique constraints: one Discord ID and one Steam ID per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_event_discord ON players(event_id, discord_id) WHERE discord_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_event_steam ON players(event_id, steam_id) WHERE steam_id IS NOT NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_players_event_id ON players(event_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_players_updated_at ON players;
CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();
