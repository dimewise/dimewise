# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Dimewise?

A mobile-first household budgeting PWA. Households set monthly budgets by category, members log expenses with per-member cost splits, and monthly settlement reports show who owes whom. The mascot is a pixel-art penguin accountant.

## Common Commands

```bash
make help              # Show all targets
make rserver           # Go server on :8081 (reads server/.env.local)
make rclient           # Vite dev server on :3000

# Docker (local dev)
make dup               # Start Postgres + Redis containers
make ddown             # Stop containers

# Database
make mcreate           # Create new sequential migration (prompts for name)
make mup               # Run migrations + regenerate go-jet models + format
make mdown             # Roll back one migration

# Code generation (run after editing openapi/openapi.yml)
make gen-openapi       # Regenerate server (oapi-codegen) + client (RTK Query)

# Lint & format
make lint              # Biome (client) + golangci-lint (server)
make format            # Format entire codebase
bun run check          # Client-only: Biome lint + format with auto-fix (run from client/)

# First-time setup
make init              # Start Docker, create DB, run migrations, install deps
```

## Architecture Overview

### Code Generation Pipeline — OpenAPI is the Single Source of Truth

```
openapi/openapi.yml
   ├── oapi-codegen → server/generated/oapi/oapi.gen.go    (strict server interface + chi wiring)
   └── @rtk-query/codegen-openapi → client/src/store/api/api.ts  (RTK Query hooks + TS types)

PostgreSQL schema (via migrations)
   └── go-jet → server/generated/dimewise/public/{model,table}/   (type-safe DB models)
```

**All files under `server/generated/` and `client/src/store/api/api.ts` are auto-generated — do not edit.**

### Adding a New API Endpoint

1. Edit `openapi/openapi.yml`
2. `make gen-openapi`
3. Implement the new `StrictServerInterface` method in `server/internal/web/`
4. Business logic in `server/internal/service/`
5. Data access in `server/internal/repository/` (go-jet queries)
6. Client hooks are auto-generated and ready to use

### Server Layers (`server/internal/`)

| Layer | Package | Rule |
|-------|---------|------|
| Transport | `web/` | Implements `oapi.StrictServerInterface`. Zero business logic. |
| Service | `service/` | Business logic, validation, orchestration. Accepts repository interfaces. |
| Repository | `repository/` | go-jet queries only. Pure data operations. |
| Config | `config/` + `config/provider/` | Dependency wiring via lazy-init provider pattern. |
| Middleware | `middleware/` | Clerk JWT auth → user upsert → `middleware.GetAppUserFromContext(ctx)` |
| Bootstrap | `boot/` | Server lifecycle, chi router setup, middleware wiring. |

Entry point: `server/cmd/server/main.go` → `config.NewConfig()` → `boot.NewServer(c)` → `s.Start()`

### Client Architecture (`client/src/`)

- **React 19 + Vite 7 + TypeScript (strict)**, package manager is **Bun**
- **Tailwind CSS 4** with oklch design tokens in `index.css` via `@theme inline`
- **UI primitives**: Radix UI + CVA wrappers in `components/ui/` (shadcn/ui pattern) — never import Radix directly in pages/features
- **State**: RTK Query for server state (no `useEffect` for fetching), React state for client-only state
- **Auth**: Clerk — token injection in `store/api/client.ts`
- **Routing**: React Router 7 with `createBrowserRouter` in `routes/Router.tsx`
- **i18n**: i18next with locales in `i18n/locales/{en,ja}.json`
- **Pages**: one component per route in `pages/`, feature components in `components/{Feature}/`
- **Imports**: use `@/` path alias for all imports from `src/`

### Monetary Values

All amounts are integers in the smallest currency unit (cents for USD, yen for JPY). Use `formatCurrency()`, `toSmallestUnit()`, `fromSmallestUnit()` from `utils/currency.ts`.

## Key Conventions

### Go
- Format: `goimports` → `golines` → `gofmt` (via `make format-server`)
- Lint: `golangci-lint` with config at `server/.golangci.yaml`
- Error wrapping: `fmt.Errorf("context: %w", err)` — never `_ = err`
- Constructor pattern: `NewXxx(deps) *Xxx`
- Accept interfaces, return structs
- Logging: `log/slog` with context

### TypeScript
- Format/lint: **Biome** only (no ESLint/Prettier), config at `client/biome.json`
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- Icons: Lucide React only. Toasts: Sonner only. Dates: date-fns only.

### OpenAPI
- Error responses use RFC 9457 Problem Details (`application/problem+json`)
- Format with `make format-openapi`

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Run `make lint` before pushing
- Commit generated files after `make gen-openapi`

## Reference Documentation

- `docs/onboarding.md` — full architecture overview and domain model
- `docs/coding-standards.md` — detailed coding standards for all layers
