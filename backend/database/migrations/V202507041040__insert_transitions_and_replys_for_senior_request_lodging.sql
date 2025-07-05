INSERT INTO senior_sync.fsm_transitions (
  campaign_name,
  trigger,
  source_state,
  dest_state,
  guard_name,
  action_name
) VALUES
  -- initialize a draft request (sets senior_id, default status=TODO)
  ('lodging_request', 'BEGIN',                  'START',                    'AWAITING_TYPE',        NULL,                       'createDraftRequestAction'),

  -- Senior picks a type (populates request_type_id; could also assign staff here)
  ('lodging_request', 'TYPE_SUBMITTED',       'AWAITING_TYPE',           'AWAITING_TITLE',       NULL,                       'captureTypeAction'),

  -- Senior submits the title
  ('lodging_request', 'TITLE_SUBMITTED',        'AWAITING_TITLE',          'AWAITING_DESCRIPTION', NULL,                       'captureTitleAction'),

  -- Senior submits the description
  ('lodging_request', 'DESCRIPTION_SUBMITTED',  'AWAITING_DESCRIPTION',    'AWAITING_PRIORITY',    NULL,                       'captureDescriptionAction'),

  -- Senior picks a priority
  ('lodging_request', 'PRIORITY_HIGH',          'AWAITING_PRIORITY',       'AWAITING_CONFIRMATION',NULL,                       'capturePriorityAction'),
  ('lodging_request', 'PRIORITY_MEDIUM',        'AWAITING_PRIORITY',       'AWAITING_CONFIRMATION',NULL,                       'capturePriorityAction'),
  ('lodging_request', 'PRIORITY_LOW',           'AWAITING_PRIORITY',       'AWAITING_CONFIRMATION',NULL,                       'capturePriorityAction'),

  -- Final confirmation: persist all fields, set completed_at & status
  ('lodging_request', 'CONFIRM_SUBMISSION',     'AWAITING_CONFIRMATION',   'COMPLETED',            NULL,                       'finalizeRequestAction'),

  -- If they want to restart and re-enter the title
  ('lodging_request', 'RESTART',                'AWAITING_CONFIRMATION',   'AWAITING_TITLE',       NULL,                       NULL),

  -- Auto-transition from COMPLETED to START to allow new requests
  ('lodging_request', 'AUTO_RESTART', 'COMPLETED', 'START', NULL, 'autoRestartAction');

-- Every state must have a corresponding row here (event for user text inputs as we need the event — which are our triggers; see step 2 and 3)
INSERT INTO senior_sync.fsm_state_reply_option (
  campaign_name,
  state,
  content,
  event
) VALUES
  ('lodging_request', 'START', 'Okay', 'BEGIN'),
  -- Step 1: Handled by custom reply option strategy

  -- Step 2: Key in Title (Empty content as this is filled in by user), we only need event
  ('lodging_request', 'AWAITING_TITLE',           '',               'TITLE_SUBMITTED'),

  -- Step 3: Key in Description
  ('lodging_request', 'AWAITING_DESCRIPTION',           '',               'DESCRIPTION_SUBMITTED'),

  -- Step 3: choose priority
  ('lodging_request', 'AWAITING_PRIORITY',       'High',                  'PRIORITY_HIGH'),
  ('lodging_request', 'AWAITING_PRIORITY',       'Medium',                'PRIORITY_MEDIUM'),
  ('lodging_request', 'AWAITING_PRIORITY',       'Low',                   'PRIORITY_LOW'),

  -- Step 4: confirm or restart
  ('lodging_request', 'AWAITING_CONFIRMATION',   'Yes, submit',           'CONFIRM_SUBMISSION'),
  ('lodging_request', 'AWAITING_CONFIRMATION',   'No—let me restart',        'RESTART'),
    ('lodging_request', 'COMPLETED', 'Create Another Request', 'AUTO_RESTART');