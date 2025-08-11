-- Create spam detection results table
CREATE TABLE senior_sync.spam_detection_results (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    is_spam BOOLEAN NOT NULL,
    confidence_score DECIMAL(5,4), -- e.g., 0.8523 for 85.23%
    detection_reason TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT fk_spam_detection_request_id
        FOREIGN KEY (request_id)
        REFERENCES senior_sync.senior_requests(id)
        ON DELETE CASCADE
);

-- Create index for efficient lookups
CREATE INDEX idx_spam_detection_request_id ON senior_sync.spam_detection_results(request_id);
CREATE INDEX idx_spam_detection_detected_at ON senior_sync.spam_detection_results(detected_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER set_spam_detection_results_updated_at
    BEFORE UPDATE ON senior_sync.spam_detection_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
