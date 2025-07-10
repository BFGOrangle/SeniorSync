-- Simplified flow: COMPLETED -> acknowledgment -> auto-transition to START for next request

-- Remove old direct AUTO_RESTART transition from COMPLETED to START (if it exists)
DELETE FROM senior_sync.fsm_transitions 
WHERE campaign_name = 'lodging_request' 
AND trigger = 'AUTO_RESTART' 
AND source_state = 'COMPLETED' 
AND dest_state = 'START';

-- Remove old AUTO_RESTART reply options from COMPLETED state (if they exist)
DELETE FROM senior_sync.fsm_state_reply_option 
WHERE campaign_name = 'lodging_request' 
AND state = 'COMPLETED' 
AND event = 'AUTO_RESTART';

-- Add simple acknowledgment transition from COMPLETED back to START
INSERT INTO senior_sync.fsm_transitions (campaign_name, trigger, source_state, dest_state, guard_name, action_name) VALUES
('lodging_request', 'ACKNOWLEDGE', 'COMPLETED', 'START', null, 'autoRestartAction');

-- Update COMPLETED state prompts to show success message
DELETE FROM senior_sync.fsm_state_prompts WHERE campaign_name = 'lodging_request' AND state = 'COMPLETED';
INSERT INTO senior_sync.fsm_state_prompts (campaign_name, state, language_code, prompt) VALUES
('lodging_request', 'COMPLETED', 'en', 'Your request has been submitted successfully! 🎉You can create another request anytime.'),
('lodging_request', 'COMPLETED', 'zh-CN', '您的请求已成功提交！🎉您可以随时创建另一个请求。'),
('lodging_request', 'COMPLETED', 'ms', 'Permintaan anda telah berjaya dihantar! 🎉Anda boleh membuat permintaan lain pada bila-bila masa.'),
('lodging_request', 'COMPLETED', 'ta', 'உங்கள் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! 🎉நீங்கள் எப்போது வேண்டுமானாலும் மற்றொரு கோரிக்கையை உருவாக்கலாம்।');

-- Add simple acknowledgment button for COMPLETED state in all languages
INSERT INTO senior_sync.fsm_state_reply_option (campaign_name, state, language_code, content, event) VALUES
-- English
('lodging_request', 'COMPLETED', 'en', 'Got it, thanks!', 'ACKNOWLEDGE'),
-- Chinese Simplified
('lodging_request', 'COMPLETED', 'zh-CN', '知道了，谢谢！', 'ACKNOWLEDGE'),
-- Malay
('lodging_request', 'COMPLETED', 'ms', 'Faham, terima kasih!', 'ACKNOWLEDGE'),
-- Tamil
('lodging_request', 'COMPLETED', 'ta', 'புரிந்தது, நன்றி!', 'ACKNOWLEDGE');