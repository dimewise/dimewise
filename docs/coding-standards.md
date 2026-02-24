# Dimewise — Coding Standards

> **Last Updated:** 2026-02-24

These standards apply to all code contributed to the Dimewise repository, whether written by humans or AI agents.

---

## General

1. **No silent error handling.** Every error must be explicitly handled — logged, returned, or acted upon. Never use `_ = err`.
2. **Single source of truth.** OpenAPI spec drives both client and server types. Do not manually duplicate types. Run code generation.
3. **Fail loudly in development.** Use `os.Exit(1)` for unrecoverable startup errors. Use proper error propagation at runtime.
4. **Prefer simplicity.** Avoid unnecessary abstractions. Add indirection only when there is a concrete need (e.g., testing, reuse).

---

## Go (Server)

### Style & Formatting

- Format with `goimports`, `golines`, and `gofmt` (in that order via `make format-server`).
- Lint with `golangci-lint` (config at `server/.golangci.yaml`).
- Maximum line length is enforced by `golines` (default 100 chars).

### Paradigms

- **Accept interfaces, return structs.** Functions should accept interface parameters for flexibility and return concrete types for clarity.
- **Constructor pattern.** Use `NewXxx(deps) *Xxx` factory functions.
- **Flat internal structure.** Inside `server/internal/`, each concern gets one directory (no deep nesting):
  - `boot/` — Server lifecycle
  - `config/` — Configuration and providers
  - `middleware/` — HTTP middleware
  - `web/` — Transport/handler layer
  - `service/` — Business logic
  - `repository/` — Data access
- **Handler methods.** Implement `oapi.StrictServerInterface` methods on the `Handler` struct. Each method delegates to the service layer — zero business logic in handlers.
- **Service layer.** Accept repository interfaces. Perform validation, orchestration, and business rules. Return domain structs/errors.
- **Repository layer.** Database queries via go-jet. Accept `context.Context` and a database executor interface. Return model structs.

### Naming

- File names: `snake_case.go`
- Package names: single lowercase word, no underscores
- Exported types/functions: `PascalCase`
- Unexported: `camelCase`
- Interfaces: verb-noun or `-er` suffix (e.g., `ExpenseReader`, `UserCreator`)
- Error variables: `errXxx` (unexported), `ErrXxx` (exported sentinel errors)

### Testing

- Test files: `*_test.go` in the same package
- Table-driven tests preferred
- Use `testify` for assertions when available
- Repository tests should use a test database (not mocks)
- Service tests should mock repository interfaces

### Database

- Migrations via `goose` using sequential numbering (`make mcreate`)
- All monetary values stored as `BIGINT` (cents/smallest unit)
- UUIDs for primary keys (`gen_random_uuid()`)
- Timestamps: `TIMESTAMP WITH TIME ZONE`, default `NOW()`
- Soft-delete using `deleted_at` column where appropriate
- Index foreign keys and frequently queried columns
- Use `NOT NULL` constraints by default; `NULL` only when semantically meaningful

### Error Propagation

```go
// DO: wrap errors with context
if err != nil {
    return fmt.Errorf("failed to create expense: %w", err)
}

// DON'T: silently discard
result, _ := repo.GetUser(ctx, id) // NEVER
```

---

## TypeScript (Client)

### Style & Formatting

- Format and lint with **Biome** (`bun run check` / `bun run format`).
- No ESLint or Prettier — Biome handles everything.

### Framework Patterns

- **React 19** with the React Compiler (via babel plugin).
- **Ant Design** for all UI components. Do not introduce additional component libraries.
- **React Router 7** for routing. Use `createBrowserRouter` with layout components.
- **RTK Query** for all server state. No manual `fetch` calls. No `useEffect` for data fetching.
- **React Hook Form + Zod** for form handling and validation.
- **Clerk** for authentication. Token injection happens in the RTK Query base query.

### State Management

- Server state: RTK Query (auto-generated from OpenAPI spec).
- Client-only state: React state (`useState`/`useReducer`) or Redux slices when cross-component state is needed.
- **Do not** store server data in Redux slices — let RTK Query manage caching.

### File Organization

```
client/src/
├── assets/          # Static assets (images, fonts, icons)
├── components/      # Reusable components organized by feature
│   └── Layout/      # Layout components
├── pages/           # Page-level components (one per route)
├── routes/          # Router config and route enums
├── store/           # Redux store + RTK Query
│   └── api/         # Generated and configured API layer
├── hooks/           # Custom hooks (when needed)
├── utils/           # Utility functions
└── types/           # Shared TypeScript types (non-API)
```

### Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities/hooks
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE` or `PascalCase` enums
- API hooks: auto-generated (e.g., `useGetUsersMeQuery`)

### Imports

- Use `@/` path alias for absolute imports from `src/`
- Biome handles import sorting

---

## OpenAPI Spec

- File: `openapi/openapi.yml`
- Version: OpenAPI 3.0
- All reusable schemas go under `components/schemas/`
- All reusable error responses go under `components/responses/`
- Error responses use **RFC 9457 Problem Details** format (`application/problem+json`)
- Use `allOf` with `BaseEntity` for entities that have `id`, `created_at`, `updated_at`
- Monetary fields: `type: integer` with description noting they are in smallest currency unit
- Request/Response bodies: use `$ref` to schemas, avoid inline definitions
- Tags: one tag per domain entity (e.g., `Households`, `Budgets`, `Expenses`)
- Format with `make format-openapi`

---

## Git & Workflow

- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- Branch naming: `feature/short-description`, `fix/short-description`
- Keep commits atomic — one logical change per commit
- Run `make lint` before pushing
- Run `make gen-openapi` after any OpenAPI spec changes and commit generated files

---

## UI/UX Guidelines

1. **Playful, not childish.** The tone is friendly and approachable for all ages.
2. **Pixel art aesthetic.** The penguin accountant mascot will appear as visual accents (not yet implemented — placeholder for now).
3. **Intuitive navigation.** Users should complete tasks with minimal clicks.
4. **Ant Design components.** Leverage the full Ant Design component library. Customize via theme tokens, not raw CSS overrides.
5. **Responsive design.** The app should work well on both desktop and mobile viewports.
6. **Accessibility.** Follow Ant Design's built-in accessibility. Ensure proper ARIA labels where custom components are used.
