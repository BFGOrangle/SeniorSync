-- 1. Drop the existing enum column
ALTER TABLE senior_sync.seniors DROP COLUMN IF EXISTS care_level;

-- 2. Drop the enum type (clean up if not used elsewhere)
DROP TYPE IF EXISTS care_color;

-- 3. Add a new VARCHAR column in place of the old one
ALTER TABLE senior_sync.seniors ADD COLUMN care_level VARCHAR;
