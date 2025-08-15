-- Migration to drop the old requests_ranking table
-- This removes the simple ranking system to prepare for AI-powered recommendations

-- Step 1: Drop indexes first (PostgreSQL best practice)
DROP INDEX IF EXISTS senior_sync.idx_requests_ranking_priority_score;
DROP INDEX IF EXISTS senior_sync.idx_requests_ranking_request_id;

-- Step 2: Drop the old requests_ranking table
DROP TABLE IF EXISTS senior_sync.requests_ranking;

-- Add comment for migration tracking
COMMENT ON SCHEMA senior_sync IS 'Removed requests_ranking table in preparation for AI recommendations system';
