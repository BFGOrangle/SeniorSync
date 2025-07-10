ALTER TABLE senior_sync.fsm_state_reply_option
ADD COLUMN language_code VARCHAR(5);

-- Backfill existing rows with 'en' as default language
UPDATE senior_sync.fsm_state_reply_option 
SET language_code = 'en'
WHERE language_code IS NULL;

-- Make the column NOT NULL after backfilling
ALTER TABLE senior_sync.fsm_state_reply_option
ALTER COLUMN language_code SET NOT NULL;

-- Update the unique constraint to include language_code
ALTER TABLE senior_sync.fsm_state_reply_option 
DROP CONSTRAINT IF EXISTS uq_state_content_event;

ALTER TABLE senior_sync.fsm_state_reply_option
ADD CONSTRAINT uq_campaign_name_state_content_event_language_code 
UNIQUE(campaign_name, state, content, event, language_code);