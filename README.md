# AutoTennant

AI-powered property management platform — from listing to lease. Landlords
list properties, tenants search and apply, the system screens and scores
applications, and Stripe Connect handles rent.

![AutoTennant screenshot](./autotennantss.png)

## Stack

**Frontend** — `frontend/`

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS with custom design tokens (`lib/design-tokens.ts`)
- Framer Motion for page transitions and microinteractions
- Zustand + React Query for state and data fetching
- NextAuth + custom JWT for authentication
- Stripe Checkout / Connect for payments
- Leaflet for property maps
- Sentry for error tracking

**Backend** — `backend/`

- FastAPI (Python 3.11+) with async SQLAlchemy 2.0 + asyncpg
- PostgreSQL 16 · Redis 7 · Alembic migrations
- ARQ for background jobs (screening, webhooks)
- Anthropic Claude for AI screening and messaging
- Stripe for rent collection and Connect payouts
- Twilio for SMS · DocuSign for e-signature
- Zillow scraping for external listing ingestion
- Structlog + Sentry for observability

**Infra** — `docker-compose.yml`, Turborepo, Make.

## Repository layout

```
.
├── frontend/          Next.js app (tenant, landlord, admin surfaces)
├── backend/           FastAPI app, workers, and migrations
├── infrastructure/    IaC and deployment configuration
├── docs/              Design and architecture notes
├── docker-compose.yml Local postgres + redis
├── Makefile           Top-level commands (dev, install, lint, test, build)
└── turbo.json         Turborepo pipeline
```

## Getting started

### Prerequisites

- Node 20+ · npm
- Python 3.11+ · pip
- Docker (for postgres + redis)

### Install + run

```bash
# One-time
make install

# Start postgres + redis, frontend (:3000), and backend (:8000)
make dev
```

Individually:

```bash
make dev-frontend   # Next.js at http://localhost:3000
make dev-backend    # FastAPI at http://localhost:8000 — docs at /docs
make docker-up      # postgres + redis only
```

### Environment

Both apps read from `.env` files at their respective roots. Required keys
include database URL, Redis URL, JWT secret, Stripe keys, Anthropic API
key, and (optionally) Twilio, DocuSign, Sentry DSN, and AWS credentials.
See `backend/app/config.py` for the full list.

## Scripts

| Command | What it does |
|---|---|
| `make dev` | Full local stack (docker + frontend + backend) |
| `make install` | Install all dependencies |
| `make lint` | Lint + type-check both apps |
| `make test` | Run all tests |
| `make build` | Production build for both apps |
| `make docker-up` / `docker-down` | Just the infra containers |

## User roles

- **Tenant** — search, apply, sign leases, pay rent, message landlords
- **Landlord** — list properties, review applications (AI-scored), schedule viewings, manage leases, collect rent via Stripe Connect
- **Admin** — user and property moderation, payment oversight, activity feed

## Design system

The frontend has a formalized design system:

- `frontend/lib/design-tokens.ts` — palette, spacing, radii, motion presets
- `frontend/app/globals.css` — glassmorphism utilities (`.glass`, `.glass-strong`, `.glass-dark`, `.glass-accent`), mesh backgrounds, typography helpers
- `frontend/components/ui/` — reusable motion primitives (`FadeIn`, `StaggerList`, `AnimatedButton`, `PageTransition`)
- `frontend/tailwind.config.ts` — tokens exposed as Tailwind utilities

## Contributing

Branches off `main`. Keep the commit message style concise and focused on
the _why_ (see `git log` for examples). Run `make lint` and `make test`
before opening a PR.
