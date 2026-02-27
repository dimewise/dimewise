# Dimewise

A playful, mobile-first household budgeting app. Households set monthly budgets by category, any member logs expenses, and at the end of each month a settlement report shows exactly who owes whom.

**Mascot:** Pixel-art penguin accountant 🐧

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS 4, Radix UI (shadcn/ui pattern) |
| Backend | Go 1.25, chi/v5, oapi-codegen |
| Database | PostgreSQL |
| Auth | Clerk |
| State | Redux Toolkit (RTK Query) |
| Migrations | goose/v3 |
| Package Manager | Bun (client), Go modules (server) |
| PWA | vite-plugin-pwa |
| Deployment | Docker Compose, Caddy (auto-HTTPS), nginx |

## Project Structure

```
dimewise/
├── client/            # React + Vite SPA
├── server/            # Go API server
├── openapi/           # OpenAPI 3.0 spec (single source of truth)
├── build/             # Production Dockerfiles, Caddyfile, compose
├── makefiles/         # Modular Makefile includes
├── docs/              # Documentation
├── docker-compose.yml # Local development stack
└── Makefile           # Top-level task runner
```

## Prerequisites

- [Bun](https://bun.sh/) (client package manager)
- [Go 1.25+](https://go.dev/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Clerk](https://clerk.com/) account (for auth keys)

## Getting Started

```bash
# 1. Clone the repo
git clone <your-repo-url> dimewise && cd dimewise

# 2. Start local infrastructure (Postgres, Redis)
make dup

# 3. Set up environment variables
cp server/.env.example server/.env.local
# Edit server/.env.local with your Clerk secret key, DB URL, etc.

# 4. Run database migrations
make migrate-up

# 5. Start the server
make run-server

# 6. In another terminal, start the client
make run-client
```

The client runs at `http://localhost:5173` and the server at `http://localhost:8080`.

## Code Generation

The OpenAPI spec is the single source of truth for both the server and client:

```bash
make gen-openapi    # Regenerate server (oapi-codegen) + client (RTK Query) from spec
make gen-jet        # Regenerate go-jet models from the database schema
```

## Key Make Targets

| Target | Description |
|--------|------------|
| `make help` | Show all available targets |
| `make dup` | Start local Docker containers |
| `make ddown` | Stop local containers |
| `make run-server` | Start the Go server |
| `make run-client` | Start the Vite dev server |
| `make migrate-up` | Run database migrations |
| `make gen-openapi` | Regenerate code from OpenAPI spec |
| `make deploy` | Build & deploy production containers |
| `make deploy-logs` | Follow production logs |
| `make deploy-ps` | Show production container status |

Run `make help` for the full list.

## Deployment

Production runs on a VPS with Docker Compose + Caddy (auto-HTTPS):

```bash
# On VPS
cd dimewise
git pull
make deploy
```

See [docs/deployment.md](docs/deployment.md) for the full VPS setup, deployment, update workflow, and troubleshooting guide.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/product-spec.md](docs/product-spec.md) | Product specification and feature details |
| [docs/onboarding.md](docs/onboarding.md) | AI agent / contributor onboarding guide |
| [docs/deployment.md](docs/deployment.md) | VPS hardening, deployment, and maintenance |
| [docs/coding-standards.md](docs/coding-standards.md) | Code style and conventions |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Implementation roadmap |

## License

Private — all rights reserved.
