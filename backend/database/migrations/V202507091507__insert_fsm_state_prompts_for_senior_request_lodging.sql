-- English (en)
INSERT INTO senior_sync.fsm_state_prompts (campaign_name, state, language_code, prompt) VALUES
('lodging_request', 'START', 'en', 'Hi there! I''m Holly, your request assistant. I''m here to help you submit a request. Select "Get Started" to begin.'),
('lodging_request', 'AWAITING_TYPE', 'en', 'Please choose a request type:'),
('lodging_request', 'AWAITING_TITLE', 'en', 'What''s the title of your request?'),
('lodging_request', 'AWAITING_DESCRIPTION', 'en', 'Please describe your request:'),
('lodging_request', 'AWAITING_PRIORITY', 'en', 'How urgent is this request?'),
('lodging_request', 'AWAITING_CONFIRMATION', 'en', 'Looks good—submit now?'),
('lodging_request', 'COMPLETED', 'en', 'Thanks! Your request has been lodged.');

-- Chinese Simplified (zh-CN)
INSERT INTO senior_sync.fsm_state_prompts (campaign_name, state, language_code, prompt) VALUES
('lodging_request', 'START', 'zh-CN', '您好！我是Holly，您的请求助手。我在这里帮助您提交请求。选择"开始"以开始。'),
('lodging_request', 'AWAITING_TYPE', 'zh-CN', '请选择请求类型：'),
('lodging_request', 'AWAITING_TITLE', 'zh-CN', '您的请求标题是什么？'),
('lodging_request', 'AWAITING_DESCRIPTION', 'zh-CN', '请描述您的请求：'),
('lodging_request', 'AWAITING_PRIORITY', 'zh-CN', '此请求的紧急程度如何？'),
('lodging_request', 'AWAITING_CONFIRMATION', 'zh-CN', '看起来不错—现在提交吗？'),
('lodging_request', 'COMPLETED', 'zh-CN', '谢谢！您的请求已提交。');

-- Malay (ms)
INSERT INTO senior_sync.fsm_state_prompts (campaign_name, state, language_code, prompt) VALUES
('lodging_request', 'START', 'ms', 'Hai! Saya Holly, pembantu permintaan anda. Saya di sini untuk membantu anda menghantar permintaan. Pilih "Mula" untuk bermula.'),
('lodging_request', 'AWAITING_TYPE', 'ms', 'Sila pilih jenis permintaan:'),
('lodging_request', 'AWAITING_TITLE', 'ms', 'Apakah tajuk permintaan anda?'),
('lodging_request', 'AWAITING_DESCRIPTION', 'ms', 'Sila huraikan permintaan anda:'),
('lodging_request', 'AWAITING_PRIORITY', 'ms', 'Sejauh mana kecemasan permintaan ini?'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ms', 'Nampak bagus—hantar sekarang?'),
('lodging_request', 'COMPLETED', 'ms', 'Terima kasih! Permintaan anda telah dihantar.');

-- Tamil (ta)
INSERT INTO senior_sync.fsm_state_prompts (campaign_name, state, language_code, prompt) VALUES
('lodging_request', 'START', 'ta', 'வணக்கம்! நான் Holly, உங்கள் கோரிக்கை உதவியாளர். உங்கள் கோரிக்கையை சமர்ப்பிக்க நான் இங்கே உள்ளேன். தொடங்க "தொடங்கு" என்பதைத் தேர்ந்தெடுக்கவும்।'),
('lodging_request', 'AWAITING_TYPE', 'ta', 'கோரிக்கை வகையைத் தேர்ந்தெடுக்கவும்:'),
('lodging_request', 'AWAITING_TITLE', 'ta', 'உங்கள் கோரிக்கையின் தலைப்பு என்ன?'),
('lodging_request', 'AWAITING_DESCRIPTION', 'ta', 'உங்கள் கோரிக்கையை விவரிக்கவும்:'),
('lodging_request', 'AWAITING_PRIORITY', 'ta', 'இந்த கோரிக்கை எவ்வளவு அவசரமானது?'),
('lodging_request', 'AWAITING_CONFIRMATION', 'ta', 'நன்றாக இருக்கிறது—இப்போது சமர்ப்பிக்கவா?'),
('lodging_request', 'COMPLETED', 'ta', 'நன்றி! உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது.');