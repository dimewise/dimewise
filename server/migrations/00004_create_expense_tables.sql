-- +goose Up
-- +goose StatementBegin

CREATE TABLE expenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id        UUID         NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    budget_category_id  UUID         REFERENCES budget_categories(id) ON DELETE SET NULL,
    paid_by             UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    logged_by           UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title               VARCHAR(255) NOT NULL,
    amount              BIGINT       NOT NULL,
    notes               TEXT,
    incurred_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_household_id ON expenses(household_id);
CREATE INDEX idx_expenses_budget_category_id ON expenses(budget_category_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_incurred_at ON expenses(incurred_at);

CREATE TABLE expense_splits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id  UUID         NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount      BIGINT       NOT NULL,

    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id ON expense_splits(user_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS expense_splits;
DROP TABLE IF EXISTS expenses;
-- +goose StatementEnd
