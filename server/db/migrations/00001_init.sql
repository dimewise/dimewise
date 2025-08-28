-- +goose Up
-- +goose StatementBegin
CREATE TYPE "currency_type" AS ENUM (
  'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD', 'AUD', 'CHF', 'CNY',
  'SEK', 'NOK', 'MXN', 'NZD', 'SGD', 'HKD', 'INR', 'RUB', 'ZAR',
  'TRY', 'BRL', 'PLN', 'MYR', 'THB', 'VND', 'IDR', 'PHP', 'TWD', 'DKK',
  'CZK', 'HUF'
);

CREATE TYPE "supported_language" AS ENUM (
  'en',
  'ja'
);

CREATE TYPE "payment_method_type" AS ENUM (
  'credit_card',
  'debit_card',
  'cash',
  'bank_transfer',
  'digital_wallet',
  'other'
);

CREATE TABLE "user" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clerk_id" TEXT NOT NULL,
  "currency" currency_type NOT NULL,
  "preferred_language" supported_language NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
COMMENT ON TABLE "user" IS 'Stores user information including preferred currency and language';

CREATE TABLE "category" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" currency_type NOT NULL,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
COMMENT ON TABLE "category" IS 'User-defined categories to organize expenses, supports soft deletion';

CREATE TABLE "payment_method" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "method_type" payment_method_type NOT NULL,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
COMMENT ON TABLE "payment_method" IS 'Stores different payment methods associated with a user, supports soft deletion';

CREATE TABLE "expense" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "payment_method_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" currency_type NOT NULL,
  "incurred_at" TIMESTAMP NOT NULL,
  "verified_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
COMMENT ON TABLE "expense" IS 'Records user expenses, linked to category and payment method';

CREATE INDEX "idx_user_clerk_id" ON "user" ("clerk_id");

CREATE INDEX "idx_category_user_id" ON "category" ("user_id");
CREATE INDEX "idx_category_user_id_not_deleted" ON "category" ("user_id") WHERE deleted_at IS NULL;

CREATE INDEX "idx_payment_method_user_id" ON "payment_method" ("user_id");
CREATE INDEX "idx_payment_method_user_id_not_deleted" ON "payment_method" ("user_id") WHERE deleted_at IS NULL;

CREATE INDEX "idx_expense_user_id" ON "expense" ("user_id");
CREATE INDEX "idx_expense_category_id" ON "expense" ("category_id");
CREATE INDEX "idx_expense_payment_method_id" ON "expense" ("payment_method_id");
CREATE INDEX "idx_expense_incurred_at" ON "expense" ("incurred_at");
CREATE INDEX "idx_expense_user_id_incurred_at" ON "expense" ("user_id", "incurred_at");

ALTER TABLE "category" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
ALTER TABLE "payment_method" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
ALTER TABLE "expense" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
ALTER TABLE "expense" ADD FOREIGN KEY ("category_id") REFERENCES "category" ("id");
ALTER TABLE "expense" ADD FOREIGN KEY ("payment_method_id") REFERENCES "payment_method" ("id");
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Drop foreign key constraints
ALTER TABLE expense DROP CONSTRAINT IF EXISTS expense_payment_method_id_fkey;
ALTER TABLE expense DROP CONSTRAINT IF EXISTS expense_category_id_fkey;
ALTER TABLE expense DROP CONSTRAINT IF EXISTS expense_user_id_fkey;
ALTER TABLE payment_method DROP CONSTRAINT IF EXISTS payment_method_user_id_fkey;
ALTER TABLE category DROP CONSTRAINT IF EXISTS category_user_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_expense_user_id_incurred_at;
DROP INDEX IF EXISTS idx_expense_incurred_at;
DROP INDEX IF EXISTS idx_expense_payment_method_id;
DROP INDEX IF EXISTS idx_expense_category_id;
DROP INDEX IF EXISTS idx_expense_user_id;

DROP INDEX IF EXISTS idx_payment_method_user_id_not_deleted;
DROP INDEX IF EXISTS idx_payment_method_user_id;

DROP INDEX IF EXISTS idx_category_user_id_not_deleted;
DROP INDEX IF EXISTS idx_category_user_id;

DROP INDEX IF EXISTS idx_user_clerk_id;

-- Drop tables
DROP TABLE IF EXISTS expense;
DROP TABLE IF EXISTS payment_method;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS "user";

-- Drop enum types
DROP TYPE IF EXISTS payment_method_type;
DROP TYPE IF EXISTS supported_language;
DROP TYPE IF EXISTS currency_type;
-- +goose StatementEnd
