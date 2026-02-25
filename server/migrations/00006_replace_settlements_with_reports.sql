-- +goose Up
-- +goose StatementBegin

-- Drop old settlement tables
DROP TABLE IF EXISTS settlement_transfers;
DROP TABLE IF EXISTS settlements;

-- Master report table (one per household per month)
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id    UUID    NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    month           INT     NOT NULL,
    year            INT     NOT NULL,
    total_expenses  INT     NOT NULL DEFAULT 0,
    total_amount    BIGINT  NOT NULL DEFAULT 0,

    generated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(household_id, month, year)
);

CREATE INDEX idx_reports_household_id ON reports(household_id);

-- Per-member summary (frozen at generation time)
CREATE TABLE report_member_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID         NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    member_name     VARCHAR(255) NOT NULL,
    total_paid      BIGINT       NOT NULL DEFAULT 0,
    total_owed      BIGINT       NOT NULL DEFAULT 0,
    net_balance     BIGINT       NOT NULL DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_member_summaries_report_id ON report_member_summaries(report_id);

-- Per-category breakdown (frozen at generation time)
CREATE TABLE report_category_breakdowns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID         NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    category_name   VARCHAR(255) NOT NULL,
    budget_amount   BIGINT       NOT NULL DEFAULT 0,
    total_spent     BIGINT       NOT NULL DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_category_breakdowns_report_id ON report_category_breakdowns(report_id);

-- Expense snapshot (frozen at generation time)
CREATE TABLE report_line_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID         NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    expense_id      UUID,
    expense_title   VARCHAR(255) NOT NULL,
    category_name   VARCHAR(255),
    paid_by_user_id UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    paid_by_name    VARCHAR(255) NOT NULL,
    amount          BIGINT       NOT NULL,
    incurred_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    notes           TEXT,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_line_items_report_id ON report_line_items(report_id);

-- Split detail per line item (frozen at generation time)
CREATE TABLE report_line_item_splits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_item_id    UUID         NOT NULL REFERENCES report_line_items(id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    member_name     VARCHAR(255) NOT NULL,
    amount          BIGINT       NOT NULL,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_line_item_splits_line_item_id ON report_line_item_splits(line_item_id);

-- Transfer instructions (who owes whom)
CREATE TABLE report_transfers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID         NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    from_user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    to_user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    from_name       VARCHAR(255) NOT NULL,
    to_name         VARCHAR(255) NOT NULL,
    amount          BIGINT       NOT NULL,
    paid_at         TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_transfers_report_id ON report_transfers(report_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS report_line_item_splits;
DROP TABLE IF EXISTS report_line_items;
DROP TABLE IF EXISTS report_transfers;
DROP TABLE IF EXISTS report_category_breakdowns;
DROP TABLE IF EXISTS report_member_summaries;
DROP TABLE IF EXISTS reports;

-- Restore old settlement tables
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
