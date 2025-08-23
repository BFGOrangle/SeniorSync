ALTER TABLE senior_sync.seniors
DROP COLUMN if EXISTS care_level_color;

ALTER TABLE senior_sync.seniors
DROP COLUMN if EXISTS care_level;

ALTER TABLE senior_sync.seniors
ADD COLUMN care_level_id BIGINT REFERENCES senior_sync.care_level_types(id);
