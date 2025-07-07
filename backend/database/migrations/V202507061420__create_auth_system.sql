-- Just add authentication fields directly to staff table
ALTER TABLE senior_sync.staff ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE senior_sync.staff ADD COLUMN role_type VARCHAR(50) DEFAULT 'STAFF' CHECK (role_type IN ('ADMIN', 'STAFF'));
ALTER TABLE senior_sync.staff ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE senior_sync.staff ADD COLUMN last_login_at TIMESTAMPTZ;

-- Rename 'role' to 'job_title' to avoid confusion
ALTER TABLE senior_sync.staff RENAME COLUMN role TO job_title;