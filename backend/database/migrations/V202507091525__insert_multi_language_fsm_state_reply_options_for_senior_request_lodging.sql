-- Update old English reply Option for start
UPDATE senior_sync.fsm_state_reply_option 
SET content = 'Get Started'
WHERE campaign_name = 'lodging_request'
AND state = 'START'
AND language_code = 'en'
AND event = 'BEGIN';

INSERT INTO senior_sync.fsm_state_reply_option (campaign_name, state, language_code, content, event) VALUES
-- Chinese Simplified (zh-CN) reply options
('lodging_request', 'START', 'zh-CN', '开始', 'BEGIN'),
('lodging_request', 'AWAITING_TITLE', 'zh-CN', '', 'TITLE_SUBMITTED'),
('lodging_request', 'AWAITING_DESCRIPTION', 'zh-CN', '', 'DESCRIPTION_SUBMITTED'),
('lodging_request', 'AWAITING_PRIORITY', 'zh-CN', '紧急', 'PRIORITY_URGENT'),
('lodging_request', 'AWAITING_PRIORITY', 'zh-CN', '高', 'PRIORITY_HIGH'),
('lodging_request', 'AWAITING_PRIORITY', 'zh-CN', '中', 'PRIORITY_MEDIUM'),
('lodging_request', 'AWAITING_PRIORITY', 'zh-CN', '低', 'PRIORITY_LOW'),
('lodging_request', 'AWAITING_CONFIRMATION', 'zh-CN', '是的，提交', 'CONFIRM_SUBMISSION'),
('lodging_request', 'AWAITING_CONFIRMATION', 'zh-CN', '不—让我重新开始', 'RESTART'),
('lodging_request', 'COMPLETED', 'zh-CN', '创建另一个请求', 'AUTO_RESTART'),
-- Malay (ms) reply options
('lodging_request', 'START', 'ms', 'Mula', 'BEGIN'),
('lodging_request', 'AWAITING_TITLE', 'ms', '', 'TITLE_SUBMITTED'),
('lodging_request', 'AWAITING_DESCRIPTION', 'ms', '', 'DESCRIPTION_SUBMITTED'),
('lodging_request', 'AWAITING_PRIORITY', 'ms', 'Mendesak', 'PRIORITY_URGENT'),
('lodging_request', 'AWAITING_PRIORITY', 'ms', 'Tinggi', 'PRIORITY_HIGH'),
('lodging_request', 'AWAITING_PRIORITY', 'ms', 'Sederhana', 'PRIORITY_MEDIUM'),
('lodging_request', 'AWAITING_PRIORITY', 'ms', 'Rendah', 'PRIORITY_LOW'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ms', 'Ya, hantar', 'CONFIRM_SUBMISSION'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ms', 'Tidak—biar saya mula semula', 'RESTART'),
('lodging_request', 'COMPLETED', 'ms', 'Buat Permintaan Lain', 'AUTO_RESTART'),
-- Tamil (ta) reply options
('lodging_request', 'START', 'ta', 'தொடங்கு', 'BEGIN'),
('lodging_request', 'AWAITING_TITLE', 'ta', '', 'TITLE_SUBMITTED'),
('lodging_request', 'AWAITING_DESCRIPTION', 'ta', '', 'DESCRIPTION_SUBMITTED'),
('lodging_request', 'AWAITING_PRIORITY', 'ta', 'அவசரம்', 'PRIORITY_URGENT'),
('lodging_request', 'AWAITING_PRIORITY', 'ta', 'உயர்', 'PRIORITY_HIGH'),
('lodging_request', 'AWAITING_PRIORITY', 'ta', 'நடுத்தரம்', 'PRIORITY_MEDIUM'),
('lodging_request', 'AWAITING_PRIORITY', 'ta', 'குறைவு', 'PRIORITY_LOW'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ta', 'ஆம், சமர்ப்பிக்கவும்', 'CONFIRM_SUBMISSION'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ta', 'இல்லை—என்னை மீண்டும் தொடங்க அனுமதிக்கவும்', 'RESTART'),
('lodging_request', 'COMPLETED', 'ta', 'மற்றொரு கோரிக்கையை உருவாக்கவும்', 'AUTO_RESTART');