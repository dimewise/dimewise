-- +goose Up
-- +goose StatementBegin

CREATE TABLE households (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    currency    VARCHAR(3)   NOT NULL DEFAULT 'USD',
    invite_code VARCHAR(20)  UNIQUE NOT NULL,
    owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_households_owner_id ON households(owner_id);
CREATE INDEX idx_households_invite_code ON households(invite_code);

CREATE TABLE household_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(household_id, user_id)
);

CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS household_members;
DROP TABLE IF EXISTS households;
-- +goose StatementEnd
