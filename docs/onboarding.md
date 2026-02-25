# Dimewise — AI Agent Onboarding Guide

> **Last Updated:** 2026-02-25

## What is Dimewise?

Dimewise is a playful household budgeting application. Households set monthly budgets broken down by categories. Any member of a household can log expenses against those budgets. Each expense can be split by custom percentages among a subset of household members. At the end of each month, Dimewise generates a settlement report: an itemized breakdown showing exactly who owes whom and how much needs to be transferred.

The mascot is a pixel-art penguin accountant. The UI/UX should feel playful, intuitive, and accessible to all ages.

---

## Repository Structure

```
dimewise/
├── client/          # React + Vite SPA (TypeScript)
├── server/          # Go backend (chi + oapi-codegen)
├── openapi/         # OpenAPI 3.0 spec (single source of truth)
├── makefiles/       # Modular Makefile includes
├── docs/            # Documentation for AI agents and contributors
├── docker-compose.yml
├── Makefile         # Top-level task runner
└── .archive/        # Previous (failed) implementation — reference only, do NOT replicate
```

### Client (`client/`)

| Concern | Technology |
|---------|-----------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite` plugin) |
| UI Primitives | Radix UI + CVA (shadcn/ui pattern) |
| Icons | Lucide React |
| Animations | Framer Motion 12 |
| Toasts | Sonner |
| Dates | date-fns |
| State Management | Redux Toolkit (RTK Query) |
| Auth | Clerk (`@clerk/clerk-react`) |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| i18n | i18next |
| Linting/Formatting | Biome |
| Package Manager | Bun |
| PWA | vite-plugin-pwa (auto-update service worker) |

> **Design philosophy:** Mobile-first PWA. The UI is built as a progressive web app with a bottom tab navigation on mobile and a sidebar on desktop. The design system uses oklch color tokens defined in `index.css` with a `@theme inline` block. All UI primitives live in `components/ui/` following the shadcn/ui composition pattern (Radix + CVA + Tailwind).

### Server (`server/`)

| Concern | Technology |
|---------|-----------|
| Language | Go 1.25 |
| Router | chi/v5 |
| Auth | Clerk SDK for Go |
| API Layer | oapi-codegen (strict server) |
| Database | PostgreSQL 18 |
| ORM/Query Builder | go-jet/v2 |
| Migrations | goose/v3 (sequential) |
| Formatting | goimports + golines + gofmt |

### Server Directory Layout (`server/internal/`)

```
internal/
├── boot/            # Server bootstrap and HTTP server lifecycle
├── config/          # Central config struct + providers
│   └── provider/    # Lazy-init providers (env, db, clerk, logger)
├── middleware/      # HTTP middleware (auth)
├── repository/      # Data access layer (go-jet queries, transactions)
├── service/         # Business logic layer (validation, orchestration)
└── web/             # Handler layer (implements oapi StrictServerInterface)
```

### Code Generation Pipeline

```
openapi/openapi.yml
        │
        ├──▶ Server: oapi-codegen → server/generated/oapi/oapi.gen.go
        │     (strict server interface, models, chi handler wiring)
        │
        └──▶ Client: @rtk-query/codegen-openapi → client/src/store/api/api.ts
              (RTK Query hooks, TypeScript types)

PostgreSQL schema
        │
        └──▶ go-jet → server/generated/dimewise/public/{model,table}/
              (type-safe table references and model structs)
```

Run `make gen-openapi` to regenerate both client and server code from the spec.

### Key Make Targets

| Target | Description |
|--------|------------|
| `make help` | Show all available targets |
| `make dup` | Start Docker containers (Postgres, Redis, Client) |
| `make rserver` | Run the Go server locally |
| `make rclient` | Run the Vite dev server locally |
| `make gen-openapi` | Regenerate code from OpenAPI spec |
| `make mup` | Run pending migrations + regenerate go-jet models |
| `make mcreate` | Create a new sequential migration |
| `make mdown` | Roll back one migration |
| `make lint` | Lint entire codebase |
| `make format` | Format entire codebase |

---

## Architecture Principles

### 1. OpenAPI-First Development

The OpenAPI spec (`openapi/openapi.yml`) is the **single source of truth** for all API contracts. Both the server's transport layer and the client's API hooks are generated from it.

**Workflow for adding a new endpoint:**
1. Define the endpoint + schemas in `openapi/openapi.yml`
2. Run `make gen-openapi`
3. Implement the generated interface method in `server/internal/web/`
4. Wire business logic through `server/internal/service/`
5. Data access via `server/internal/repository/`
6. Client hooks are auto-generated and ready to use

### 2. Server Layer Responsibilities

| Layer | Package | Responsibility |
|-------|---------|---------------|
| **Transport** | `web/` | Implements `oapi.StrictServerInterface`. Extracts context, delegates to services, maps service errors to HTTP responses. **Zero business logic.** |
| **Service** | `service/` | Business logic, validation, orchestration. Accepts interfaces (repositories), returns structs/errors. |
| **Repository** | `repository/` | Database access via go-jet. Pure data operations. Returns model structs. |
| **Config** | `config/` | Dependency wiring via provider pattern. |

### 3. Error Handling

- **RFC 9457 (Problem Details)** is the error response format.
- Errors must **never** be silently swallowed — always handle and propagate.
- Service layer returns domain-specific errors with codes; the handler layer maps them to HTTP status codes.

### 4. Monetary Values

All monetary amounts are stored as **integers in the smallest currency unit** (e.g., cents for USD). This avoids floating-point precision issues. Presentation-layer formatting is the client's responsibility.

---

## Domain Model Overview

### Core Entities

- **User** — Authenticated via Clerk. Has a `clerk_id` linking to the external identity provider.
- **Household** — A group of users sharing budgets. Has a designated currency.
- **HouseholdMember** — Join table linking users to households.
- **BudgetCategory** — A monthly spending category within a household (e.g., "Groceries", "Rent"). Has a capped amount.
- **Expense** — A recorded spend, optionally linked to a budget category. Logged by any household member.
- **ExpenseSplit** — Defines how an expense's cost is distributed among household members (by absolute amount).
- **Settlement** — Monthly report generated for a specific month/year showing net transfers between members.
- **SettlementTransfer** — A single directional transfer (from → to) within a settlement, markable as paid.

### Key Business Rules

1. A household has a set of monthly budgets; the sum of all budget amounts = total monthly budget.
2. Any household member can create expenses in their household (budget category is optional).
3. Each expense is split by absolute amounts among household members; splits must sum to the total expense amount.
4. Settlements are manually generated for a given month/year (unique per household + month + year).
5. The debt simplification algorithm calculates net balances (paid − owed) and minimizes the number of transfers using a two-pointer approach.
6. The person who paid for an expense is credited; split members who didn't pay are debited.

---

## The `.archive/` Directory

The `.archive/` folder contains a previous implementation that was abandoned. It used:
- React Native (Expo) mobile app instead of a web SPA
- Individual-user budgeting instead of household-based
- Categories + PaymentMethods + Expenses model (no splitting)

**Do NOT replicate the archive's architecture or patterns.** It is kept only as domain context reference. The new implementation has a fundamentally different scope (household budgeting with splitting and settlements).
