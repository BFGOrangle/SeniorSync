-- Add due_date column to senior_requests table
-- This allows optional due dates for requests to improve planning and prioritization

ALTER TABLE senior_sync.senior_requests 
ADD COLUMN due_date TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN senior_sync.senior_requests.due_date IS 'Optional due date for when the request should be completed';
