-- Create team registrations table
CREATE TABLE IF NOT EXISTS team_registrations (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_discord VARCHAR(100),
  contact_steam VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES team_registrations(id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  steam_id VARCHAR(50) NOT NULL,
  is_captain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_registrations_status ON team_registrations(status);
CREATE INDEX IF NOT EXISTS idx_team_registrations_created_at ON team_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_steam_id ON team_members(steam_id);

-- Ensure team names are unique (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_registrations_name_unique 
ON team_registrations(LOWER(team_name));

-- Add constraint to ensure exactly one captain per team
CREATE OR REPLACE FUNCTION check_single_captain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_captain = TRUE THEN
    -- Check if there's already a captain for this team
    IF EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = NEW.team_id 
      AND is_captain = TRUE 
      AND id != COALESCE(NEW.id, -1)
    ) THEN
      RAISE EXCEPTION 'Team can only have one captain';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_single_captain
  BEFORE INSERT OR UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION check_single_captain();
