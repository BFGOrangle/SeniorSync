-- Add FSM transition from INIT to START
INSERT INTO senior_sync.fsm_transitions (campaign_name, trigger, source_state, dest_state, guard_name, action_name) VALUES
  ('lodging_request', 'FIRSTCHATOPEN', 'INIT', 'START', NULL, NULL);