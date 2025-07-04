-- Seed data for senior requests
-- This creates diverse sample data for testing the request management system

INSERT INTO senior_sync.senior_requests (
  senior_id, 
  assigned_staff_id, 
  request_type_id, 
  title, 
  description, 
  status, 
  priority,
  created_at,
  updated_at,
  completed_at
)
VALUES
  -- Pending requests with various priorities
  (1, NULL, 1, 'Help reading medication labels', 'Eleanor needs assistance reading the small print on her new prescription bottles. The text is too small for her to read clearly.', 'TODO', 4, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NULL),
  
  (2, 3, 3, 'Transportation to doctor appointment', 'Herbert has a cardiology appointment next Tuesday at 2 PM and needs reliable transportation to the medical center.', 'TODO', 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL),
  
  (3, NULL, 8, 'Setup new smartphone', 'Margaret received a new smartphone from her daughter but needs help setting it up and learning basic functions.', 'TODO', 2, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NULL),
  
  (4, 1, 5, 'Weekly grocery shopping', 'Richard needs assistance with his weekly grocery shopping. He has mobility issues and finds it difficult to navigate the store.', 'TODO', 2, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', NULL),
  
  (5, NULL, 10, 'Wellness check - missed calls', 'Barbara has not answered her regular check-in calls for 2 days. Urgent wellness check needed.', 'TODO', 5, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NULL),
  
  -- In-progress requests
  (6, 2, 6, 'Meal preparation assistance', 'Joseph needs help preparing nutritious meals. He has diabetes and needs guidance on proper meal planning.', 'IN_PROGRESS', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour', NULL),
  
  (7, 4, 7, 'Light housekeeping', 'Dorothy requested help with light cleaning tasks including dusting, vacuuming, and organizing her living room.', 'IN_PROGRESS', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes', NULL),
  
  (8, 5, 12, 'Insurance paperwork assistance', 'Charles needs help understanding and filling out his Medicare supplement insurance forms.', 'IN_PROGRESS', 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', NULL),
  
  (9, 6, 9, 'Weekly social visit', 'Ruth feels isolated and would appreciate regular social visits for companionship and conversation.', 'IN_PROGRESS', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NULL),
  
  (10, 7, 11, 'Garden maintenance', 'Edward needs help with basic garden maintenance including watering plants and light weeding.', 'IN_PROGRESS', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '6 hours', NULL),
  
  -- Completed requests
  (11, 8, 4, 'Medication reminder setup', 'Frances needed help setting up a pill organizer and medication reminder system.', 'COMPLETED', 3, NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  (12, 9, 2, 'Moving furniture', 'Frank needed assistance rearranging his living room furniture to improve mobility and safety.', 'COMPLETED', 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  (1, 10, 15, 'Post office errand', 'Eleanor needed help mailing packages and picking up certified mail from the post office.', 'COMPLETED', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  (2, 1, 14, 'Physical therapy exercises', 'Herbert received guidance on his prescribed physical therapy exercises for his knee rehabilitation.', 'COMPLETED', 3, NOW() - INTERVAL '1 week', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  
  (3, 2, 13, 'Personal care assistance', 'Margaret received assistance with personal hygiene tasks during her recovery from minor surgery.', 'COMPLETED', 4, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
  
  -- Additional urgent and high priority requests for testing
  (4, NULL, 10, 'Emergency wellness check', 'Richard activated his emergency alert system. Immediate check needed to ensure safety.', 'TODO', 5, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes', NULL),
  
  (5, 3, 4, 'Missed medication doses', 'Barbara has been confused about her medication schedule and may have missed several doses.', 'TODO', 4, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NULL),
  
  (6, NULL, 3, 'Emergency medical transport', 'Joseph needs urgent transportation to the emergency room for chest pain evaluation.', 'TODO', 5, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes', NULL),
  
  (7, 5, 8, 'Technology emergency', 'Dorothy accidentally deleted important photos on her tablet and needs immediate help recovering them.', 'IN_PROGRESS', 4, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NULL),
  
  (8, NULL, 1, 'Important letter reading', 'Charles received an urgent letter from his insurance company that needs immediate attention.', 'TODO', 4, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NULL),
  
  -- Low priority requests for comprehensive testing
  (9, 6, 9, 'Monthly social visit', 'Ruth would like to schedule her regular monthly social visit for next week.', 'TODO', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL),
  
  (10, NULL, 11, 'Spring garden preparation', 'Edward wants help preparing his garden for spring planting when weather permits.', 'TODO', 1, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NULL),
  
  (11, 7, 15, 'Library book return', 'Frances needs someone to return her library books and pick up new ones when convenient.', 'TODO', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL),
  
  (12, NULL, 6, 'Cooking lesson request', 'Frank would like to learn how to prepare some simple, healthy meals for himself.', 'TODO', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
  
  -- More in-progress requests for testing kanban functionality
  (1, 8, 7, 'Deep cleaning assistance', 'Eleanor needs help with seasonal deep cleaning including windows and organizing closets.', 'IN_PROGRESS', 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 hours', NULL),
  
  (2, 9, 12, 'Tax preparation help', 'Herbert needs assistance organizing documents and understanding tax forms for this year.', 'IN_PROGRESS', 3, NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 days', NULL);
