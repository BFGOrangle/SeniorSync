INSERT INTO senior_sync.fsm_state_reply_option (campaign_name, state, language_code, content, event) VALUES
('lodging_request', 'AWAITING_PRIORITY', 'en', 'Urgent', 'PRIORITY_URGENT');

INSERT INTO senior_sync.fsm_transitions (
  campaign_name,
  trigger,
  source_state,
  dest_state,
  guard_name,
  action_name
) VALUES
  ('lodging_request', 'PRIORITY_URGENT', 'AWAITING_PRIORITY', 'AWAITING_CONFIRMATION', NULL, 'capturePriorityAction');