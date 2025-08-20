-- Migration to drop the unused ai_recommendations table
-- This table was created but never implemented in the application code
-- The working AI recommendation system uses a different architecture

-- Step 1: Drop triggers first
DROP TRIGGER IF EXISTS set_ai_recommendations_updated_at ON senior_sync.ai_recommendations;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_created_at;
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_urgency_level;
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_processing_status;
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_priority_score;
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_user_id;
DROP INDEX IF EXISTS senior_sync.idx_ai_recommendations_request_id;

-- Step 3: Drop the table
DROP TABLE IF EXISTS senior_sync.ai_recommendations;

-- Step 4: Add comment for documentation
COMMENT ON SCHEMA senior_sync IS 'Removed unused ai_recommendations table - application uses different AI architecture via requests_ranking table';
