ALTER TABLE senior_sync.seniors 
ALTER COLUMN care_level_id DROP NOT NULL;

ALTER TABLE senior_sync.seniors 
ALTER COLUMN care_level_id SET DEFAULT NULL;


