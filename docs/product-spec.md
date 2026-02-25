# Dimewise — Product Specification

 > **Last Updated:** 2026-02-25

## Vision

Dimewise is a playful, mobile-first household budgeting app. Households set monthly budgets by category, any member logs expenses, and at the end of each month, a settlement report shows exactly who owes whom.

**Mascot:** Pixel-art penguin accountant (future visual asset).
**Style:** Playful, intuitive, accessible to all ages. Mobile-first PWA with Tailwind CSS 4 + Radix UI (shadcn/ui pattern).

---

## Core Concepts

### Household

- A household is a group of people sharing a budget (e.g., a family, roommates).
- One person creates the household and becomes the **owner** (the person managing the finances).
- Other members join via an **invite code**.
- **MVP:** A user can belong to only one household at a time. (Future: multiple households.)
- Everyone has equal visibility — all expenses and settlements are transparent.
- Each household has a single **currency** (future: multi-currency support).
- **Supported currencies at launch:**
  - **Standard (2 decimal places):** USD, EUR, GBP, CAD, AUD, SGD, HKD, NZD, CHF
  - **Zero-decimal:** JPY, KRW
  - All amounts are stored as integers in the **smallest unit** (cents for USD, whole yen for JPY, etc.). The currency's `exponent` (0 or 2) determines display formatting.

### Budgets

- A household defines monthly budgets organized by **categories** (e.g., Groceries, Rent, Utilities, Entertainment).
- Each budget category has an **amount** (in smallest currency unit, e.g., cents).
- The sum of all budget category amounts = the household's **total monthly budget**.
- Budgets are set once and **roll over automatically** to each new month.
- Budgets **can be edited at any time** (even mid-month) for simplicity.
- A **budget history** table records every change with timestamps, enabling graphs of budget/usage over time.
- **Warnings/notifications** should surface when spending in a category is close to or exceeds the budget.

### Expenses

- Any household member can log an expense.
- **Budget category is optional** — expenses can exist without being tied to a category.
- The **payer is selectable** — the person logging the expense can specify who actually paid.
- Expense metadata:
  - **Title** (required)
  - **Amount** (required, integer in smallest currency unit)
  - **Date incurred** (required)
  - **Budget category** (optional)
  - **Notes** (optional)
- Receipt upload is **deferred** (not in MVP).

### Expense Splitting

- Each expense must be split among one or more household members.
- Splits are stored as **absolute amounts** (in smallest currency unit), not percentages.
- All split amounts must be non-negative and must **sum exactly to the total expense amount**.
- The UI provides a "Split Evenly" button to distribute the amount equally (with remainder distributed to the first members).
- Members can be added/removed from splits dynamically.

### Settlement Reports

- **Manually generated** via the UI for any given month/year.
- Cannot generate the same month twice (unique constraint on household + month + year).
- The report contains:
  - **Net transfer amounts** — who owes whom and how much (debt-simplified)
- **Viewable as history** (past months can be browsed).
- Each transfer has a **paid status**: members can **mark transfers as paid/completed**.
- **Auto-generation on 1st of month** is a future enhancement.

---

## Settlement Calculation Algorithm

Given a month's worth of expenses with splits:

1. For each expense, determine how much each member **should** pay based on splits.
2. For each expense, record who **actually** paid.
3. For each member, calculate:
   - **Total paid** = sum of all expenses where they were the payer
   - **Total owed** = sum of their split portions across all expenses
   - **Net balance** = Total paid − Total owed
4. Members with positive balances are owed money; members with negative balances owe money.
5. Minimize the number of transfers needed to settle all debts (debt simplification).

### Example

Household members: Alice, Bob, Charlie

| Expense | Payer | Amount | Alice% | Bob% | Charlie% |
|---------|-------|--------|--------|------|----------|
| Groceries | Alice | $100 | 40% | 30% | 30% |
| Dinner | Bob | $60 | 33% | 34% | 33% |
| Utilities | Alice | $90 | 50% | 25% | 25% |

**Calculated shares:**
- Alice owes: $40 + $20 + $45 = $105
- Bob owes: $30 + $20 + $22.50 = $72.50
- Charlie owes: $30 + $20 + $22.50 = $72.50

**Amounts paid:**
- Alice paid: $100 + $90 = $190
- Bob paid: $60
- Charlie paid: $0

**Net balance (paid − owed):**
- Alice: $190 − $105 = +$85 (is owed $85)
- Bob: $60 − $72.50 = −$12.50 (owes $12.50)
- Charlie: $0 − $72.50 = −$72.50 (owes $72.50)

**Transfers:**
- Bob → Alice: $12.50
- Charlie → Alice: $72.50

---

## Data Model

### Tables

```
users
  id              UUID PK
  clerk_id        VARCHAR(255) UNIQUE NOT NULL
  email           VARCHAR(255) UNIQUE NOT NULL
  first_name      VARCHAR(100)
  last_name       VARCHAR(100)
  avatar_url      TEXT
  last_login_at   TIMESTAMPTZ
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

households
  id              UUID PK
  name            VARCHAR(255) NOT NULL
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD'  -- ISO 4217 code
  invite_code     VARCHAR(20) UNIQUE NOT NULL
  owner_id        UUID FK → users.id NOT NULL
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

household_members
  id              UUID PK
  household_id    UUID FK → households.id NOT NULL
  user_id         UUID FK → users.id NOT NULL
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE(household_id, user_id)

budget_categories
  id              UUID PK
  household_id    UUID FK → households.id NOT NULL
  name            VARCHAR(255) NOT NULL
  amount          BIGINT NOT NULL          -- monthly budget in cents
  sort_order      INT NOT NULL DEFAULT 0
  deleted_at      TIMESTAMPTZ              -- soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

budget_history
  id              UUID PK
  budget_category_id  UUID FK → budget_categories.id NOT NULL
  amount          BIGINT NOT NULL          -- the budget amount at this point
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  changed_by      UUID FK → users.id NOT NULL

expenses
  id              UUID PK
  household_id    UUID FK → households.id NOT NULL
  budget_category_id  UUID FK → budget_categories.id  -- nullable, ON DELETE SET NULL
  paid_by         UUID FK → users.id NOT NULL  -- who actually paid
  logged_by       UUID FK → users.id NOT NULL  -- who entered it
  title           VARCHAR(255) NOT NULL
  amount          BIGINT NOT NULL          -- total amount in smallest unit
  notes           TEXT
  incurred_at     TIMESTAMPTZ NOT NULL
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

expense_splits
  id              UUID PK
  expense_id      UUID FK → expenses.id ON DELETE CASCADE NOT NULL
  user_id         UUID FK → users.id NOT NULL
  amount          BIGINT NOT NULL          -- split amount in smallest unit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

settlements
  id              UUID PK
  household_id    UUID FK → households.id ON DELETE CASCADE NOT NULL
  month           INT NOT NULL             -- 1-12
  year            INT NOT NULL
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE(household_id, month, year)

settlement_transfers
  id              UUID PK
  settlement_id   UUID FK → settlements.id ON DELETE CASCADE NOT NULL
  from_user_id    UUID FK → users.id NOT NULL
  to_user_id      UUID FK → users.id NOT NULL
  amount          BIGINT NOT NULL          -- in smallest unit
  paid_at         TIMESTAMPTZ              -- NULL until marked as paid
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Notes on Split Values

- Splits store **absolute amounts** in the smallest currency unit (same unit as the expense amount).
- All splits for an expense must sum exactly to the expense's total amount.
- The UI provides a "Split Evenly" helper that distributes the total equally, assigning any remainder (from integer division) to the first members.

---

## Future Considerations (Not MVP)

- Multiple households per user
- Multi-currency support (per-member or per-expense currency with exchange rate conversion, additional currencies beyond the launch set)
- Receipt photo upload + OCR
- Notifications (push/email) for budget warnings, settlement generation
- Recurring expenses
- Nested budget sub-categories
- Gamification (savings goals, inter-household competition)
- Mid-month settlements
- Budget locking (draft → active → locked state machine)
- Financial analytics and trends
