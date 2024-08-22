create type "public"."currencies" as enum ('USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'NOK', 'KRW', 'INR', 'BRL', 'RUB', 'ZAR', 'TRY', 'MXN', 'SGD', 'HKD');

create sequence "public"."account_id_seq";

create sequence "public"."category_id_seq";

create sequence "public"."expense_id_seq";

create sequence "public"."user_id_seq";

create table "public"."account" (
    "id" integer not null default nextval('"account_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "name" text not null,
    "description" text,
    "currency" "currencies" not null,
    "userId" text
);


create table "public"."category" (
    "id" integer not null default nextval('"category_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "name" text not null,
    "budget" integer not null,
    "userId" text,
    "uuid" uuid not null default gen_random_uuid()
);


create table "public"."expense" (
    "id" integer not null default nextval('"expense_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "title" text not null,
    "description" text default ''''''::text,
    "amount" integer not null,
    "date" timestamp(3) without time zone not null,
    "categoryId" uuid not null,
    "userId" text not null,
    "uuid" uuid not null default gen_random_uuid()
);


create table "public"."user" (
    "id" integer not null default nextval('"user_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "email" text not null,
    "authId" text not null,
    "name" text,
    "avatarUrl" text,
    "defaultCurrency" "currencies" not null
);


alter sequence "public"."account_id_seq" owned by "public"."account"."id";

alter sequence "public"."category_id_seq" owned by "public"."category"."id";

alter sequence "public"."expense_id_seq" owned by "public"."expense"."id";

alter sequence "public"."user_id_seq" owned by "public"."user"."id";

CREATE UNIQUE INDEX "account_pkey" ON public."account" USING btree (id);

CREATE UNIQUE INDEX "category_pkey" ON public."category" USING btree (id);

CREATE UNIQUE INDEX "category_uuid_key" ON public."category" USING btree (uuid);

CREATE UNIQUE INDEX "expense_pkey" ON public."expense" USING btree (id);

CREATE UNIQUE INDEX "expense_uuid_key" ON public."expense" USING btree (uuid);

CREATE UNIQUE INDEX "user_authId_key" ON public."user" USING btree ("authId");

CREATE UNIQUE INDEX "user_email_key" ON public."user" USING btree (email);

CREATE UNIQUE INDEX "user_pkey" ON public."user" USING btree (id);

alter table "public"."account" add constraint "account_pkey" PRIMARY KEY using index "account_pkey";

alter table "public"."category" add constraint "category_pkey" PRIMARY KEY using index "category_pkey";

alter table "public"."expense" add constraint "expense_pkey" PRIMARY KEY using index "expense_pkey";

alter table "public"."user" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."account" add constraint "public_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("authId") not valid;

alter table "public"."account" validate constraint "public_account_userId_fkey";

alter table "public"."category" add constraint "category_uuid_key" UNIQUE using index "category_uuid_key";

alter table "public"."category" add constraint "public_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("authId") not valid;

alter table "public"."category" validate constraint "public_category_userId_fkey";

alter table "public"."expense" add constraint "expense_uuid_key" UNIQUE using index "expense_uuid_key";

alter table "public"."expense" add constraint "public_expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"(uuid) not valid;

alter table "public"."expense" validate constraint "public_expense_categoryId_fkey";

alter table "public"."expense" add constraint "public_expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("authId") not valid;

alter table "public"."expense" validate constraint "public_expense_userId_fkey";

alter table "public"."user" add constraint "user_authId_key" UNIQUE using index "user_authId_key";

grant insert on table "public"."account" to "anon";

grant select on table "public"."account" to "anon";

grant update on table "public"."account" to "anon";

grant insert on table "public"."account" to "authenticated";

grant select on table "public"."account" to "authenticated";

grant update on table "public"."account" to "authenticated";

grant insert on table "public"."category" to "anon";

grant select on table "public"."category" to "anon";

grant update on table "public"."category" to "anon";

grant insert on table "public"."category" to "authenticated";

grant select on table "public"."category" to "authenticated";

grant update on table "public"."category" to "authenticated";

grant insert on table "public"."expense" to "anon";

grant select on table "public"."expense" to "anon";

grant update on table "public"."expense" to "anon";

grant insert on table "public"."expense" to "authenticated";

grant select on table "public"."expense" to "authenticated";

grant update on table "public"."expense" to "authenticated";

grant insert on table "public"."user" to "anon";

grant select on table "public"."user" to "anon";

grant update on table "public"."user" to "anon";

grant insert on table "public"."user" to "authenticated";

grant select on table "public"."user" to "authenticated";

grant update on table "public"."user" to "authenticated";
