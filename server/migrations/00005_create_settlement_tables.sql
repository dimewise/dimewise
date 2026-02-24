-- +goose Up
-- +goose StatementBegin

CREATE TABLE settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id    UUID    NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    month           INT     NOT NULL,
    year            INT     NOT NULL,

    generated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(household_id, month, year)
);

CREATE INDEX idx_settlements_household_id ON settlements(household_id);

CREATE TABLE settlement_transfers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id   UUID   NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    from_user_id    UUID   NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    to_user_id      UUID   NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount          BIGINT NOT NULL,
    paid_at         TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlement_transfers_settlement_id ON settlement_transfers(settlement_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS settlement_transfers;
DROP TABLE IF EXISTS settlements;
-- +goose StatementEnd
