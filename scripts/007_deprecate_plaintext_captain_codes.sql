-- Remove legacy plaintext captain code persistence.
-- Strategy:
-- 1) Backfill missing hashes from legacy plaintext rows.
-- 2) Enforce hash-only lookup/storage.
-- 3) Drop deprecated plaintext `code` column.

BEGIN;

-- Backfill: derive SHA-256 hash for rows created before hash-only writes.
UPDATE captain_codes
SET code_hash = encode(digest(upper(trim(code)), 'sha256'), 'hex')
WHERE (code_hash IS NULL OR code_hash = '')
  AND code IS NOT NULL
  AND trim(code) <> '';

-- Ensure every row has a hash before removing plaintext column.
ALTER TABLE captain_codes
  ALTER COLUMN code_hash SET NOT NULL;

-- Remove deprecated plaintext code storage.
ALTER TABLE captain_codes
  DROP COLUMN IF EXISTS code;

COMMIT;
