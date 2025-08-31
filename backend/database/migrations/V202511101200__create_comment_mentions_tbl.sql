-- Create comment mentions table to track which staff members are mentioned in comments
CREATE TABLE senior_sync.comment_mentions (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    mentioned_staff_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_comment_mentions_comment_id 
        FOREIGN KEY (comment_id) 
        REFERENCES senior_sync.request_comments(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_comment_mentions_staff_id 
        FOREIGN KEY (mentioned_staff_id) 
        REFERENCES senior_sync.staff(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate mentions
    CONSTRAINT uk_comment_mentions_comment_staff 
        UNIQUE (comment_id, mentioned_staff_id)
);

-- Indexes for better query performance
CREATE INDEX idx_comment_mentions_comment_id ON senior_sync.comment_mentions(comment_id);
CREATE INDEX idx_comment_mentions_staff_id ON senior_sync.comment_mentions(mentioned_staff_id);
CREATE INDEX idx_comment_mentions_created_at ON senior_sync.comment_mentions(created_at);

-- Comments for documentation
COMMENT ON TABLE senior_sync.comment_mentions IS 'Stores which staff members are mentioned in comments using @ functionality';
COMMENT ON COLUMN senior_sync.comment_mentions.comment_id IS 'ID of the comment that contains the mention';
COMMENT ON COLUMN senior_sync.comment_mentions.mentioned_staff_id IS 'ID of the staff member who was mentioned';
COMMENT ON COLUMN senior_sync.comment_mentions.created_at IS 'When the mention was created';