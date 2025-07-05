CREATE TYPE care_color AS ENUM ('GREEN', 'YELLOW', 'RED', 'PURPLE', 'WHITE');

ALTER TABLE senior_sync.senior_profiles ADD COLUMN care_level care_color;