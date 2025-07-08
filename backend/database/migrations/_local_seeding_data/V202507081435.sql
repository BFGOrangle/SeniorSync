UPDATE senior_sync.seniors
SET care_level = 'HIGH',
    characteristics = '["diabetic", "wheelchair"]',
    care_level_color = '#f97316'
WHERE first_name = 'Eleanor' AND last_name = 'Thompson';

UPDATE senior_sync.seniors
SET care_level = 'MEDIUM',
    characteristics = '["fall_risk", "memory_loss"]',
    care_level_color = '#eab308'
WHERE first_name = 'Herbert' AND last_name = 'Davis';

UPDATE senior_sync.seniors
SET care_level = 'LOW',
    characteristics = '["active", "no_assistance_required"]',
    care_level_color = '#22c55e'
WHERE first_name = 'Margaret' AND last_name = 'Wilson';

UPDATE senior_sync.seniors
SET care_level = 'CRITICAL',
    characteristics = '["bedridden", "feeding_tube", "nurse_required"]',
    care_level_color = '#ef4444'
WHERE first_name = 'Richard' AND last_name = 'Martin';

UPDATE senior_sync.seniors
SET care_level = 'MEDIUM',
    characteristics = '["hearing_loss", "walking_stick"]',
    care_level_color = '#eab308'
WHERE first_name = 'Barbara' AND last_name = 'Taylor';

UPDATE senior_sync.seniors
SET care_level = 'HIGH',
    characteristics = '["diabetic", "vision_impairment"]',
    care_level_color = '#f97316'
WHERE first_name = 'Joseph' AND last_name = 'Anderson';

UPDATE senior_sync.seniors
SET care_level = 'LOW',
    characteristics = '["independent", "active_socially"]',
    care_level_color = '#22c55e'
WHERE first_name = 'Dorothy' AND last_name = 'Thomas';

UPDATE senior_sync.seniors
SET care_level = 'CRITICAL',
    characteristics = '["paralysis", "nurse_required"]',
    care_level_color = '#ef4444'
WHERE first_name = 'Charles' AND last_name = 'Jackson';

UPDATE senior_sync.seniors
SET care_level = 'MEDIUM',
    characteristics = '["dementia", "fall_risk"]',
    care_level_color = '#eab308'
WHERE first_name = 'Ruth' AND last_name = 'White';

UPDATE senior_sync.seniors
SET care_level = 'HIGH',
    characteristics = '["oxygen_support", "limited_mobility"]',
    care_level_color = '#f97316'
WHERE first_name = 'Edward' AND last_name = 'Harris';

UPDATE senior_sync.seniors
SET care_level = 'LOW',
    characteristics = '["fully_independent"]',
    care_level_color = '#22c55e'
WHERE first_name = 'Frances' AND last_name = 'Clark';

UPDATE senior_sync.seniors
SET care_level = 'CRITICAL',
    characteristics = '["stroke_history", "wheelchair", "speech_difficulty"]',
    care_level_color = '#ef4444'
WHERE first_name = 'Frank' AND last_name = 'Lewis';
