-- Create reminders table for the reminder service
CREATE TABLE IF NOT EXISTS senior_sync.reminders (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    staff_assignee_id BIGINT REFERENCES senior_sync.staff(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reminder_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on request_id for better query performance
CREATE INDEX IF NOT EXISTS idx_reminders_request_id ON senior_sync.reminders(request_id);

-- Create index on reminder_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON senior_sync.reminders(reminder_date);

CREATE TRIGGER reminders_updated_at 
    BEFORE UPDATE ON senior_sync.reminders 
    FOR EACH ROW 
    EXECUTE FUNCTION set_updated_at();
