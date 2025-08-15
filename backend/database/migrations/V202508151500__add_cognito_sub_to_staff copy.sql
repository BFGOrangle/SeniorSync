-- Migration to add Cognito sub column to staff table
-- This migration adds cognito_sub as a new column while keeping the existing id as primary key

-- Step 1: Add new UUID column for Cognito sub
ALTER TABLE senior_sync.staff ADD COLUMN cognito_sub UUID;

-- Step 2: Create a unique index on the new column
CREATE UNIQUE INDEX idx_staff_cognito_sub ON senior_sync.staff(cognito_sub);

-- Step 3: Add useful indexes
CREATE INDEX idx_staff_center_id_active ON senior_sync.staff(center_id, is_active);
CREATE INDEX idx_staff_role_center ON senior_sync.staff(role_type, center_id);