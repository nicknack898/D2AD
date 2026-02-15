-- SQL script to clean up test registration data
-- Run this after API testing to remove test entries

-- First, let's see what test data exists
SELECT 
  id,
  team_name,
  contact_email,
  status,
  created_at
FROM team_registrations 
WHERE 
  LOWER(team_name) LIKE '%test%' 
  OR contact_email LIKE '%test%'
  OR contact_email LIKE '%example.com'
ORDER BY created_at DESC;

-- Delete test team members first (foreign key constraint)
DELETE FROM team_members 
WHERE team_id IN (
  SELECT id FROM team_registrations 
  WHERE 
    LOWER(team_name) LIKE '%test%' 
    OR contact_email LIKE '%test%'
    OR contact_email LIKE '%example.com'
);

-- Then delete test team registrations
DELETE FROM team_registrations 
WHERE 
  LOWER(team_name) LIKE '%test%' 
  OR contact_email LIKE '%test%'
  OR contact_email LIKE '%example.com';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_registrations
FROM team_registrations;

SELECT 
  COUNT(*) as remaining_members  
FROM team_members;

-- Show remaining data
SELECT 
  tr.team_name,
  tr.contact_email,
  tr.status,
  COUNT(tm.id) as member_count
FROM team_registrations tr
LEFT JOIN team_members tm ON tr.id = tm.team_id
GROUP BY tr.id, tr.team_name, tr.contact_email, tr.status
ORDER BY tr.created_at DESC;
