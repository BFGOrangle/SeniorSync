CREATE TABLE senior_sync.fsm_state_prompts (
    id            BIGINT       GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    state         VARCHAR(50)  NOT NULL,
    language_code VARCHAR(10)   NOT NULL, -- e.g., 'en', 'zh-CN', 'ms', 'ta'
    prompt        VARCHAR      NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_campaign_name_state_language_code UNIQUE(campaign_name, state, language_code)
);