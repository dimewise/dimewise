# Dimewise — Implementation Plan

> **Last Updated:** 2026-02-24

This plan is broken into phases. Each phase is self-contained: it delivers working functionality end-to-end (database → server → client). Phases should be completed sequentially — each one builds on the previous.

---

## Phase 1: Users & Households

**Goal:** Users can create a household, generate an invite code, and others can join.

### Database Migrations

- `00002_create_households_table.sql`
  - `households` table (id, name, currency, invite_code, owner_id → users, timestamps)
  - `household_members` table (id, household_id → households, user_id → users, joined_at)
  - Unique constraint on (household_id, user_id)
  - Index on invite_code

### OpenAPI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/households` | Create a household (caller becomes owner + first member) |
| GET | `/households/me` | Get the current user's household (with members) |
| POST | `/households/join` | Join a household via invite code |
| POST | `/households/invite-code/regenerate` | Regenerate the household's invite code (owner only) |
| DELETE | `/households/members/{userId}` | Remove a member (owner only, cannot remove self) |
| DELETE | `/households` | Delete the household (owner only) |

### Server

- **Repository:** `HouseholdReader` interface + implementation (get by ID, get by invite code, get by user, get members)
- **Repository:** `UserReader` interface + implementation (get by clerk_id, get by ID)
- **Service:** `HouseholdService` (create, join, leave, regenerate invite code, remove member, delete)
- **Web/Handler:** Implement the generated `StrictServerInterface` methods
- Complete the `GetUsersMe` handler (currently returns an error stub)
- User upsert on first authenticated request (sync from Clerk)

### Client

- Auth flow with Clerk (sign-in, sign-up screens)
- Authenticated layout with navigation
- Create household page
- Join household page (enter invite code)
- Household dashboard (shows members, invite code)
- Settings page (leave household, manage members for owner)

### Deliverable
A user can register/login, create or join a household, and see household members.

---

## Phase 2: Budget Categories

**Goal:** Household members can set up and manage monthly budget categories.

### Database Migrations

- `00003_create_budget_tables.sql`
  - `budget_categories` table (id, household_id, name, amount, sort_order, deleted_at, timestamps)
  - `budget_history` table (id, budget_category_id, amount, changed_at, changed_by → users)

### OpenAPI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/budgets` | List all budget categories for the user's household |
| POST | `/budgets` | Create a budget category |
| PATCH | `/budgets/{budgetId}` | Update a budget category (name, amount, sort_order) |
| DELETE | `/budgets/{budgetId}` | Soft-delete a budget category |
| GET | `/budgets/overview` | Get total budget vs total spent for current month |

### Server

- **Repository:** `BudgetReader` interface (list by household, get by ID, get spending summary)
- **Repository:** `BudgetWriter` interface (create, update, soft-delete, record history)
- **Service:** `BudgetService` (CRUD with validation, auto-record history on amount change)
- **Web/Handler:** Implement generated interface methods

### Client

- Budget list view (shows categories with amounts and progress bars)
- Create/edit budget category modal
- Budget overview card (total budget, total spent, remaining)
- Warning indicators when spending approaches/exceeds budget

### Deliverable
Household members can create, edit, and delete budget categories with a monthly overview.

---

## Phase 3: Expenses

**Goal:** Household members can log expenses with splitting.

### Database Migrations

- `00004_create_expense_tables.sql`
  - `expenses` table (id, household_id, budget_category_id, paid_by → users, logged_by → users, title, amount, notes, incurred_at, timestamps)
  - `expense_splits` table (id, expense_id, user_id, split_type, value, timestamps)

### OpenAPI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/expenses` | List expenses (with filters: date range, category, member) |
| POST | `/expenses` | Create an expense (with splits) |
| GET | `/expenses/{expenseId}` | Get expense detail with splits |
| PATCH | `/expenses/{expenseId}` | Update an expense |
| DELETE | `/expenses/{expenseId}` | Delete an expense |

### Server

- **Repository:** `ExpenseReader` interface (list with filters & pagination, get by ID with splits)
- **Repository:** `ExpenseWriter` interface (create with splits, update, delete)
- **Service:** `ExpenseService` (CRUD, split validation — sums to 100% or total amount, date validation)
- **Web/Handler:** Implement generated interface methods

### Client

- Expense list view with filters (date range, category, payer)
- Add expense form (select payer, budget category, configure splits)
- Split configuration UI (toggle percentage/fixed, add/remove members, live validation)
- Expense detail view
- Edit/delete expense

### Deliverable
Members can log expenses, split them among household members, and browse/filter the expense list.

---

## Phase 4: Settlements

**Goal:** Monthly settlement reports auto-generate and show who owes whom.

### Database Migrations

- `00005_create_settlement_tables.sql`
  - `settlements` table (id, household_id, month, year, generated_at, unique on household+month+year)
  - `settlement_transfers` table (id, settlement_id, from_user_id, to_user_id, amount, paid_at, timestamps)

### OpenAPI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settlements` | List settlements (history) |
| GET | `/settlements/{settlementId}` | Get settlement detail with transfers |
| POST | `/settlements/generate` | Manually trigger settlement generation (for testing/admin) |
| PATCH | `/settlements/transfers/{transferId}` | Mark a transfer as paid |

### Server

- **Repository:** `SettlementReader` interface (list by household, get by ID with transfers)
- **Repository:** `SettlementWriter` interface (create settlement + transfers, mark paid)
- **Service:** `SettlementService` (settlement calculation algorithm, debt simplification, generation logic)
- **Scheduled job / cron:** Auto-generate settlements on 1st of each month (can be a simple goroutine or external cron)

### Client

- Settlement history list
- Settlement detail view (itemized breakdown, transfer list)
- Mark transfer as paid button
- Settlement summary card on dashboard

### Deliverable
Monthly settlement reports generate automatically, showing net transfers. Members can mark transfers as completed.

---

## Phase 5: Dashboard & Polish

**Goal:** A polished home experience with insights and budget health indicators.

### Features

- **Dashboard home page:**
  - Current month budget overview (total budget, spent, remaining)
  - Per-category spending progress bars with warning colors
  - Recent expenses list
  - Pending settlement transfers (if any)
- **Budget warnings:** Visual indicators when spending hits 80% and 100% of a category's budget
- **Responsive polish:** Ensure all views work well on mobile viewports
- **Empty states:** Friendly onboarding prompts when no household, no budgets, or no expenses exist
- **Error handling:** Toast notifications for errors, loading skeletons for data fetching
- **Theme:** Configure Ant Design theme tokens for the Dimewise brand (playful color palette)

---

## Implementation Order Per Phase

Each phase follows the same sequence:

```
1. Write database migration  →  make mcreate, write SQL
2. Run migration             →  make mup (also regenerates go-jet models)
3. Update OpenAPI spec        →  edit openapi/openapi.yml
4. Generate code             →  make gen-openapi
5. Server: repository         →  implement data access layer
6. Server: service            →  implement business logic
7. Server: handler            →  implement generated interface methods
8. Client: pages + components →  build UI using generated RTK Query hooks
9. Format + lint              →  make format && make lint
```

---

## Architecture Checklist (applied per phase)

- [ ] Migration follows naming conventions (sequential, descriptive)
- [ ] All monetary values stored as BIGINT (cents/smallest unit)
- [ ] OpenAPI spec uses `$ref` to shared schemas, RFC 9457 error responses
- [ ] Generated code committed after `make gen-openapi`
- [ ] Repository accepts interfaces, returns structs
- [ ] Service validates input, returns domain errors
- [ ] Handler does zero business logic — delegates to service
- [ ] Client uses only RTK Query hooks for server state
- [ ] Forms use React Hook Form + Zod validation
- [ ] All errors handled explicitly (no silent swallowing)
- [ ] `make lint` passes

---

## Currency Configuration

Currencies are categorized by their **exponent** (number of decimal places in the smallest unit):

| Code | Name | Exponent | Smallest Unit |
|------|------|----------|---------------|
| USD | US Dollar | 2 | cent (1 USD = 100 cents) |
| EUR | Euro | 2 | cent |
| GBP | British Pound | 2 | penny |
| CAD | Canadian Dollar | 2 | cent |
| AUD | Australian Dollar | 2 | cent |
| SGD | Singapore Dollar | 2 | cent |
| HKD | Hong Kong Dollar | 2 | cent |
| NZD | New Zealand Dollar | 2 | cent |
| CHF | Swiss Franc | 2 | rappen |
| JPY | Japanese Yen | 0 | yen (no subdivision) |
| KRW | Korean Won | 0 | won (no subdivision) |

The exponent is used for:
- **Storage:** Amount `1050` in USD = $10.50, in JPY = ¥1050
- **Display:** Format with `exponent` decimal places
- **Split validation:** Percentage basis points (10000 = 100%) work identically regardless of currency

This table should be maintained as a constant in both server and client code (not in the database).
