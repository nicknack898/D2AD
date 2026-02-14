-- SQL script to verify the registration test data was stored correctly

-- Check team registrations table
SELECT 
  id,
  team_name,
  contact_email,
  contact_discord,
  contact_steam,
  status,
  created_at,
  notes
FROM team_registrations 
ORDER BY created_at DESC 
LIMIT 10;

-- Check team members for the most recent registrations
SELECT 
  tr.team_name,
  tm.player_name,
  tm.steam_id,
  tm.is_captain,
  tm.created_at
FROM team_registrations tr
JOIN team_members tm ON tr.id = tm.team_id
WHERE tr.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY tr.created_at DESC, tm.is_captain DESC, tm.id;

-- Count total registrations by status
SELECT 
  status,
  COUNT(*) as count
FROM team_registrations 
GROUP BY status
ORDER BY count DESC;

-- Check for any duplicate Steam IDs (should be none)
SELECT 
  steam_id,
  COUNT(*) as count,
  STRING_AGG(player_name, ', ') as players
FROM team_members 
GROUP BY steam_id 
HAVING COUNT(*) > 1;

-- Check for any duplicate team names (should be none)
SELECT 
  LOWER(team_name) as team_name_lower,
  COUNT(*) as count,
  STRING_AGG(team_name, ', ') as actual_names
FROM team_registrations 
GROUP BY LOWER(team_name) 
HAVING COUNT(*) > 1;

-- Show team registration with member details (JSON aggregation)
SELECT 
  tr.id,
  tr.team_name,
  tr.contact_email,
  tr.status,
  tr.created_at,
  json_agg(
    json_build_object(
      'name', tm.player_name,
      'steam_id', tm.steam_id,
      'is_captain', tm.is_captain
    ) ORDER BY tm.is_captain DESC, tm.id
  ) as members
FROM team_registrations tr
LEFT JOIN team_members tm ON tr.id = tm.team_id
WHERE tr.created_at >= NOW() - INTERVAL '1 hour'
GROUP BY tr.id, tr.team_name, tr.contact_email, tr.status, tr.created_at
ORDER BY tr.created_at DESC;
