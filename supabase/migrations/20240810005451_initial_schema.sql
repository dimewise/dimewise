CREATE TYPE "public"."currencies" AS ENUM ('USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'NOK', 'KRW', 'INR', 'BRL', 'RUB', 'ZAR', 'TRY', 'MXN', 'SGD', 'HKD');

CREATE TABLE "public"."account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" "currencies" NOT NULL,
    "created_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "public"."category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "public"."expense" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "public"."user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "default_currency" "currencies" NOT NULL,
    "created_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "account_pkey" ON public."account" USING btree (id);

CREATE UNIQUE INDEX "category_pkey" ON public."category" USING btree (id);

CREATE UNIQUE INDEX "expense_pkey" ON public."expense" USING btree (id);

CREATE UNIQUE INDEX "user_pkey" ON public."user" USING btree (id);

CREATE UNIQUE INDEX "user_email_key" ON public."user" USING btree (email);

ALTER TABLE "public"."account" ADD CONSTRAINT "account_pkey" PRIMARY KEY USING INDEX "account_pkey";

ALTER TABLE "public"."category" ADD CONSTRAINT "category_pkey" PRIMARY KEY USING INDEX "category_pkey";

ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_pkey" PRIMARY KEY USING INDEX "expense_pkey";

ALTER TABLE "public"."user" ADD CONSTRAINT "user_pkey" PRIMARY KEY USING INDEX "user_pkey";

ALTER TABLE "public"."account" ADD CONSTRAINT "public_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");

ALTER TABLE "public"."category" ADD CONSTRAINT "public_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");

ALTER TABLE "public"."expense" ADD CONSTRAINT "public_expense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");

ALTER TABLE "public"."expense" ADD CONSTRAINT "public_expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."account" TO "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."category" TO "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."expense" TO "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."user" TO "authenticated";
