INSERT INTO senior_sync.fsm_transitions (
  campaign_name,
  trigger,
  source_state,
  dest_state,
  guard_name,
  action_name
) VALUES
  -- initialize a draft request (sets senior_id, default status=TODO)
  ('lodging_request', 'START',                  'START',                    'AWAITING_TYPE',        NULL,                       'createDraftRequestAction'),

  -- Senior picks a type (populates request_type_id; could also assign staff here)
  ('lodging_request', 'TYPE_MAINTENANCE',       'AWAITING_TYPE',           'AWAITING_TITLE',       NULL,                       'captureTypeAction'),
  ('lodging_request', 'TYPE_TRANSPORT',         'AWAITING_TYPE',           'AWAITING_TITLE',       NULL,                       'captureTypeAction'),
  ('lodging_request', 'TYPE_MEDICAL',           'AWAITING_TYPE',           'AWAITING_TITLE',       NULL,                       'captureTypeAction'),

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
  ('lodging_request', 'RESTART',                'AWAITING_CONFIRMATION',   'AWAITING_TITLE',       NULL,                       NULL);

INSERT INTO senior_sync.fsm_state_reply_option (
  campaign_name,
  state,
  content,
  event
) VALUES
  -- Step 1: choose type
  ('lodging_request', 'AWAITING_TYPE',           'Maintenance',           'TYPE_MAINTENANCE'),
  ('lodging_request', 'AWAITING_TYPE',           'Transport',             'TYPE_TRANSPORT'),
  ('lodging_request', 'AWAITING_TYPE',           'Medical',               'TYPE_MEDICAL'),

  -- Step 3: choose priority
  ('lodging_request', 'AWAITING_PRIORITY',       'High',                  'PRIORITY_HIGH'),
  ('lodging_request', 'AWAITING_PRIORITY',       'Medium',                'PRIORITY_MEDIUM'),
  ('lodging_request', 'AWAITING_PRIORITY',       'Low',                   'PRIORITY_LOW'),

  -- Step 4: confirm or restart
  ('lodging_request', 'AWAITING_CONFIRMATION',   'Yes, submit',           'CONFIRM_SUBMISSION'),
  ('lodging_request', 'AWAITING_CONFIRMATION',   'No—let me edit',        'RESTART');