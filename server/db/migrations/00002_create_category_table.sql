-- +goose Up
-- +goose StatementBegin

CREATE TABLE category (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    account_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    budget INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (account_id) REFERENCES account(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE category;

-- +goose StatementEnd
