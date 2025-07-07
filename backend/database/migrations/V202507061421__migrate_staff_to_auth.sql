-- Populate authentication fields for existing staff
-- Default password: 'welcome123' (bcrypt hashed - staff should change on first login)
UPDATE senior_sync.staff 
SET 
    password_hash = '$2a$10$9ah3hcR7vOY3cw15G7ZimuSOem/VGYESaaYJXxBgyQWSq5HfQQRWO',
    is_active = TRUE,
    role_type = CASE 
        WHEN job_title IN ('Administrator', 'Program Director') THEN 'ADMIN'
        ELSE 'STAFF'
    END
WHERE password_hash IS NULL;

-- Make email required for authentication (constraint)
ALTER TABLE senior_sync.staff ALTER COLUMN contact_email SET NOT NULL;

-- Add unique constraint on email for login
ALTER TABLE senior_sync.staff ADD CONSTRAINT uq_staff_email UNIQUE (contact_email);

-- Add indexes for authentication queries
CREATE INDEX idx_staff_email ON senior_sync.staff(contact_email);
CREATE INDEX idx_staff_role_type ON senior_sync.staff(role_type);
CREATE INDEX idx_staff_active ON senior_sync.staff(is_active);