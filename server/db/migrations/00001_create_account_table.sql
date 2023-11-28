-- +goose Up
-- +goose StatementBegin

CREATE TABLE account (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    email  VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE account;

-- +goose StatementEnd
