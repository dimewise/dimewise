create type "public"."Currencies" as enum ('USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'NOK', 'KRW', 'INR', 'BRL', 'RUB', 'ZAR', 'TRY', 'MXN', 'SGD', 'HKD');

create sequence "public"."Account_id_seq";

create sequence "public"."Category_id_seq";

create sequence "public"."Expense_id_seq";

create sequence "public"."User_id_seq";

create table "public"."Account" (
    "id" integer not null default nextval('"Account_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "name" text not null,
    "description" text,
    "currency" "Currencies" not null,
    "userId" text
);


create table "public"."Category" (
    "id" integer not null default nextval('"Category_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "name" text not null,
    "budget" integer not null,
    "userId" text,
    "uuid" uuid not null default gen_random_uuid()
);


create table "public"."Expense" (
    "id" integer not null default nextval('"Expense_id_seq"'::regclass),
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


create table "public"."User" (
    "id" integer not null default nextval('"User_id_seq"'::regclass),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "email" text not null,
    "authId" text not null,
    "name" text,
    "avatarUrl" text,
    "defaultCurrency" "Currencies" not null
);


alter sequence "public"."Account_id_seq" owned by "public"."Account"."id";

alter sequence "public"."Category_id_seq" owned by "public"."Category"."id";

alter sequence "public"."Expense_id_seq" owned by "public"."Expense"."id";

alter sequence "public"."User_id_seq" owned by "public"."User"."id";

CREATE UNIQUE INDEX "Account_pkey" ON public."Account" USING btree (id);

CREATE UNIQUE INDEX "Category_pkey" ON public."Category" USING btree (id);

CREATE UNIQUE INDEX "Category_uuid_key" ON public."Category" USING btree (uuid);

CREATE UNIQUE INDEX "Expense_pkey" ON public."Expense" USING btree (id);

CREATE UNIQUE INDEX "Expense_uuid_key" ON public."Expense" USING btree (uuid);

CREATE UNIQUE INDEX "User_authId_key" ON public."User" USING btree ("authId");

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

CREATE UNIQUE INDEX "User_pkey" ON public."User" USING btree (id);

alter table "public"."Account" add constraint "Account_pkey" PRIMARY KEY using index "Account_pkey";

alter table "public"."Category" add constraint "Category_pkey" PRIMARY KEY using index "Category_pkey";

alter table "public"."Expense" add constraint "Expense_pkey" PRIMARY KEY using index "Expense_pkey";

alter table "public"."User" add constraint "User_pkey" PRIMARY KEY using index "User_pkey";

alter table "public"."Account" add constraint "public_Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authId") not valid;

alter table "public"."Account" validate constraint "public_Account_userId_fkey";

alter table "public"."Category" add constraint "Category_uuid_key" UNIQUE using index "Category_uuid_key";

alter table "public"."Category" add constraint "public_Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authId") not valid;

alter table "public"."Category" validate constraint "public_Category_userId_fkey";

alter table "public"."Expense" add constraint "Expense_uuid_key" UNIQUE using index "Expense_uuid_key";

alter table "public"."Expense" add constraint "public_Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(uuid) not valid;

alter table "public"."Expense" validate constraint "public_Expense_categoryId_fkey";

alter table "public"."Expense" add constraint "public_Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authId") not valid;

alter table "public"."Expense" validate constraint "public_Expense_userId_fkey";

alter table "public"."User" add constraint "User_authId_key" UNIQUE using index "User_authId_key";

grant insert on table "public"."Account" to "anon";

grant select on table "public"."Account" to "anon";

grant update on table "public"."Account" to "anon";

grant insert on table "public"."Account" to "authenticated";

grant select on table "public"."Account" to "authenticated";

grant update on table "public"."Account" to "authenticated";

grant insert on table "public"."Category" to "anon";

grant select on table "public"."Category" to "anon";

grant update on table "public"."Category" to "anon";

grant insert on table "public"."Category" to "authenticated";

grant select on table "public"."Category" to "authenticated";

grant update on table "public"."Category" to "authenticated";

grant insert on table "public"."Expense" to "anon";

grant select on table "public"."Expense" to "anon";

grant update on table "public"."Expense" to "anon";

grant insert on table "public"."Expense" to "authenticated";

grant select on table "public"."Expense" to "authenticated";

grant update on table "public"."Expense" to "authenticated";

grant insert on table "public"."User" to "anon";

grant select on table "public"."User" to "anon";

grant update on table "public"."User" to "anon";

grant insert on table "public"."User" to "authenticated";

grant select on table "public"."User" to "authenticated";

grant update on table "public"."User" to "authenticated";


