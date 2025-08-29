ALTER TABLE senior_sync.request_types 
ADD COLUMN is_global BOOLEAN DEFAULT FALSE;

UPDATE senior_sync.request_types
SET is_global = TRUE
WHERE is_global = FALSE;  -- all existing rows were created before column, now flip to TRUE

ALTER TABLE senior_sync.request_types 
ADD COLUMN center_id BIGINT REFERENCES senior_sync.centers(id);
