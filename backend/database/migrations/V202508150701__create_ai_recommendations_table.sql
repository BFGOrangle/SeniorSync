-- Migration to create the new ai_recommendations table
-- This implements the AI-powered recommendations system

-- Step 1: Create the new ai_recommendations table
CREATE TABLE senior_sync.ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    user_id BIGINT,
    priority_score INTEGER,
    priority_reason VARCHAR(1000),
    urgency_level VARCHAR(50),
    recommendation_text VARCHAR(2000),
    processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_ai_recommendations_request_id
        FOREIGN KEY (request_id)
        REFERENCES senior_sync.senior_requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_recommendations_user_id
        FOREIGN KEY (user_id)
        REFERENCES senior_sync.staff(id)
        ON DELETE SET NULL,

    -- Check constraints
    CONSTRAINT chk_ai_recommendations_processing_status
        CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),

    CONSTRAINT chk_ai_recommendations_urgency_level
        CHECK (urgency_level IS NULL OR urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    CONSTRAINT chk_ai_recommendations_priority_score
        CHECK (priority_score IS NULL OR (priority_score >= 0 AND priority_score <= 100)),

    -- Unique constraint to ensure one recommendation per request
    CONSTRAINT uk_ai_recommendations_request_id UNIQUE (request_id)
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX idx_ai_recommendations_request_id ON senior_sync.ai_recommendations(request_id);
CREATE INDEX idx_ai_recommendations_user_id ON senior_sync.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_priority_score ON senior_sync.ai_recommendations(priority_score DESC) WHERE priority_score IS NOT NULL;
CREATE INDEX idx_ai_recommendations_processing_status ON senior_sync.ai_recommendations(processing_status);
CREATE INDEX idx_ai_recommendations_urgency_level ON senior_sync.ai_recommendations(urgency_level) WHERE urgency_level IS NOT NULL;
CREATE INDEX idx_ai_recommendations_created_at ON senior_sync.ai_recommendations(created_at DESC);

-- Step 3: Add trigger for automatic updated_at timestamp
CREATE TRIGGER set_ai_recommendations_updated_at
    BEFORE UPDATE ON senior_sync.ai_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Step 4: Add comments for documentation
COMMENT ON TABLE senior_sync.ai_recommendations IS 'AI-powered recommendations for senior care requests with processing status tracking';
COMMENT ON COLUMN senior_sync.ai_recommendations.request_id IS 'Reference to the senior request being analyzed';
COMMENT ON COLUMN senior_sync.ai_recommendations.user_id IS 'User who requested the AI recommendation (optional)';
COMMENT ON COLUMN senior_sync.ai_recommendations.priority_score IS 'AI-calculated priority score (0-100, higher = more urgent)';
COMMENT ON COLUMN senior_sync.ai_recommendations.priority_reason IS 'AI explanation for the priority score';
COMMENT ON COLUMN senior_sync.ai_recommendations.urgency_level IS 'AI-determined urgency level';
COMMENT ON COLUMN senior_sync.ai_recommendations.recommendation_text IS 'AI-generated recommendation text';
COMMENT ON COLUMN senior_sync.ai_recommendations.processing_status IS 'Current status of AI processing (PENDING, PROCESSING, COMPLETED, FAILED)';
