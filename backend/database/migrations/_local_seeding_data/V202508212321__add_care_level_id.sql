UPDATE senior_sync.seniors
SET care_level_id = FLOOR(random() * 3)::int + 1
WHERE care_level_id IS NULL;