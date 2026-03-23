# python-react-keycloak

A full-stack demo application combining **React 19**, **FastAPI**, **Keycloak**, **PostgreSQL**, and **Ollama** — containerised with Docker Compose and designed as a clean reference architecture.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Auth | Keycloak 26 (PKCE S256 OIDC flow) |
| Backend | FastAPI, Python 3.13, SQLAlchemy 2 (async) |
| Database | PostgreSQL 17 (two databases: `keycloak` + `app_data`) |
| LLM | Ollama (`llama3.2:3b`) — translation, explanation, chat |
| Reverse proxy | Nginx (production React SPA serving) |
| Orchestration | Docker Compose |

---

## Quick start

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- `make` — pre-installed on macOS/Linux. On Windows, see the note below.
- Node 20+ (only needed for local frontend development)

> **Windows users** — the shell scripts (`*.sh`) always run inside Linux
> Docker containers, so they work fine regardless of host OS.  For the
> `make` commands on the host you have three options:
>
> | Option | How |
> |---|---|
> | **WSL2** (recommended) | Open a WSL terminal, clone the repo there, run `make` normally |
> | **Git Bash** | Install Git for Windows; `make` works in the Git Bash terminal |
> | **PowerShell** | Use `.\make.ps1 <target>` instead of `make <target>` |
>
> **Line endings** — the repo ships with a `.gitattributes` file that
> enforces LF on all shell scripts and Dockerfiles.  If you cloned before
> this file was present, run `git add --renormalize .` once to fix any
> CRLF-converted files.

### 1 — Clone and configure

```bash
git clone <repo-url>
cd python-react-keycloak
cp infra/.env.example infra/.env        # fill in the required values
cp fastapi/.env.example fastapi/.env    # fill in the required values
```

Key variables in `infra/.env`:

```env
POSTGRES_USER=keycloak
POSTGRES_PASSWORD=<choose a strong password>
POSTGRES_DB=keycloak
KC_ADMIN=admin
KC_ADMIN_PASSWORD=<choose a strong password>
```

Key variables in `fastapi/.env`:

```env
POSTGRES_USER=keycloak
POSTGRES_PASSWORD=<same as above>
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=app_data

KC_SERVER_URL=http://keycloak:8080
KC_REALM_NAME=demo
KC_CLIENT_ID=react-client

OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
```

### 2 — Start all containers

```bash
make up
```

On **first boot** everything is automatic:

- **Ollama** — starts the server, detects the model is missing, pulls `llama3.2:3b` (~2.0 GB, takes a few minutes). The model is stored in the `ollama_data` volume, so subsequent starts skip the download and are instant.
- **FastAPI** — waits for Ollama's healthcheck to pass (model present), then creates the `books` table and seeds the 20-book catalogue before accepting requests.

No manual steps required. Watch progress with `make logs`.

### 3 — Configure Keycloak

Open [http://localhost:8080](http://localhost:8080), log in with the admin credentials from your `.env`, and:

1. Create a realm named **`demo`**
2. Create a client named **`react-client`**
   - Client authentication: **OFF** (public client)
   - Valid redirect URIs: `http://localhost:5173/*` and `http://localhost:3000/*`
   - Web origins: `*`
3. Create a test user

### 5 — Open the app

| Service | URL |
|---|---|
| React SPA | http://localhost:3000 |
| FastAPI docs | http://localhost:8000/docs |
| Keycloak admin | http://localhost:8080 |
| Ollama API | http://localhost:11434 |

---

## Development workflow

### Local frontend (Vite HMR)

Run the React dev server against the Docker backend:

```bash
make dev          # starts Vite on http://localhost:5173
```

All `/api/*` requests are proxied to `http://localhost:8000` by Vite's dev proxy (configured in `react/vite.config.ts`), so no CORS setup is needed in development.

### Common commands

```bash
make build        # rebuild Docker images after code changes
make restart      # rebuild + restart (shortcut for build + up)
make logs         # tail all container logs
make logs-api     # tail only FastAPI
make seed         # re-seed the book catalogue (destructive)
make ps           # show container status
make clean        # stop containers and wipe volumes (deletes all DB data)
make help         # list all available targets
```

---

## Project structure

```
python-react-keycloak/
├── fastapi/                   FastAPI backend
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── endpoints/     books.py  quotes.py  ollama.py  system.py
│   │   ├── core/              config.py  db.py
│   │   ├── models/            book.py
│   │   ├── schemas/           book.py  user_payload.py
│   │   └── main.py            app factory + lifespan (auto-create + auto-seed)
│   ├── seed_db.py             CLI seed script + seed_if_empty() helper
│   ├── requirements.txt
│   └── Dockerfile
├── react/                     React frontend
│   ├── src/
│   │   ├── api/               axios-instance.ts (deprecated — use ApiContext)
│   │   ├── auth/              keycloak.ts
│   │   ├── context/           ApiContext.tsx (Keycloak-aware axios)
│   │   ├── hooks/             UseAxios.ts
│   │   ├── pages/             WelcomePage.tsx
│   │   └── types/             book.ts
│   ├── nginx.conf             Production Nginx config
│   ├── vite.config.ts         Vite config + dev proxy
│   └── Dockerfile
├── infra/
│   ├── docker-compose.yml
│   ├── postgres/
│   │   └── init-db.sh         Creates the app_data database alongside keycloak
│   └── .env                   Runtime secrets (not committed)
├── Makefile
└── README.md
```

---

## API reference

All endpoints are available under `/api/v1/`. Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Liveness probe |
| GET | `/api/v1/quote` | No | Ollama-generated daily quote |
| GET | `/api/v1/books/` | No | Paginated book catalogue (`?page=1&page_size=6&q=&category=`) |
| POST | `/api/v1/ollama/query` | Yes | Free-form LLM chat |
| POST | `/api/v1/ollama/translate` | Yes | Translate text to a target language |
| POST | `/api/v1/ollama/explain` | Yes | Literary analysis of a text |
| GET | `/api/v1/system/system-data` | Yes | Authenticated system telemetry |

---

## Architecture decisions

**Two PostgreSQL databases** — Keycloak manages its own `keycloak` database; application data lives in `app_data`. They share a single Postgres instance but are fully isolated. The `infra/postgres/init-db.sh` script creates `app_data` automatically on first container start.

**Auto-seeding on startup** — `main.py`'s lifespan handler calls `create_all` then `seed_if_empty`. On first boot the 20-book catalogue is inserted; on subsequent boots the check is a single `COUNT(*)` query and exits immediately.

**Vite dev proxy** — In development, Vite proxies `/api/*` to `localhost:8000`. In production (Docker), Nginx serves the React build as static files and the browser calls the FastAPI container directly through its published port. No environment-specific URL switching is needed in the frontend code.

**Ollama error handling** — If the model isn't pulled yet, endpoints return `503 Service Unavailable` with a human-readable message instead of leaking Ollama's internal 404.

---

## Licence

MIT
