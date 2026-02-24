-- +goose Up
-- +goose StatementBegin

CREATE TABLE budget_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id    UUID         NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    amount          BIGINT       NOT NULL,
    sort_order      INT          NOT NULL DEFAULT 0,

    deleted_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_categories_household_id ON budget_categories(household_id);

CREATE TABLE budget_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_category_id  UUID   NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    amount              BIGINT NOT NULL,
    changed_by          UUID   NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    changed_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_history_category_id ON budget_history(budget_category_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS budget_history;
DROP TABLE IF EXISTS budget_categories;
-- +goose StatementEnd
