# ─────────────────────────────────────────────────────────────────────────────
# Makefile — python-react-keycloak
# Run `make` or `make help` to see all available targets.
# Windows users: use .\make.ps1 <target> (PowerShell) or run inside WSL / Git Bash.
# ─────────────────────────────────────────────────────────────────────────────

COMPOSE       := docker compose -f infra/docker-compose.yml
FASTAPI_CTR   := fastapi
OLLAMA_CTR    := ollama
REACT_DIR     := react
OLLAMA_MODEL  := llama3.2:1b

# Terminal colours (no-op on terminals that don't support ANSI)
BOLD  := \033[1m
CYAN  := \033[36m
GREEN := \033[32m
YELLOW:= \033[33m
RED   := \033[31m
RESET := \033[0m

.PHONY: \
  up down build restart reset \
  seed pull-model list-models \
  logs logs-api logs-react logs-db logs-ollama \
  ps status health \
  dev install fmt check \
  help

# ── Lifecycle ─────────────────────────────────────────────────────────────────

up: ## Start all containers in the background
	@echo "$(CYAN)▶ Starting containers…$(RESET)"
	@$(COMPOSE) up -d
	@echo "$(GREEN)✓ All containers started. Run 'make status' to check health.$(RESET)"

down: ## Stop and remove containers (volumes are preserved)
	@echo "$(CYAN)▶ Stopping containers…$(RESET)"
	@$(COMPOSE) down

build: ## Rebuild Docker images (use after code changes)
	@echo "$(CYAN)▶ Building images…$(RESET)"
	@$(COMPOSE) build

restart: ## Rebuild images then restart all containers
	@echo "$(CYAN)▶ Rebuilding and restarting…$(RESET)"
	@$(COMPOSE) build
	@$(COMPOSE) up -d
	@echo "$(GREEN)✓ Done. Run 'make status' to check health.$(RESET)"

reset: ## ⚠ Stop containers AND delete all volumes (wipes the database)
	@echo "$(RED)⚠ This will permanently delete all data volumes.$(RESET)"
	@printf "$(YELLOW)Are you sure? [y/N] $(RESET)"; read ans; \
	  [ "$$ans" = "y" ] || [ "$$ans" = "Y" ] && \
	  $(COMPOSE) down -v && echo "$(GREEN)✓ Volumes removed.$(RESET)" || \
	  echo "$(YELLOW)Cancelled.$(RESET)"

# ── Database ──────────────────────────────────────────────────────────────────

seed: ## Force re-seed the books catalogue inside the running container (destructive)
	@echo "$(CYAN)▶ Re-seeding books catalogue…$(RESET)"
	@docker exec $(FASTAPI_CTR) python seed_db.py
	@echo "$(GREEN)✓ Seed complete.$(RESET)"

# ── Ollama ────────────────────────────────────────────────────────────────────

pull-model: ## Force re-pull the Ollama model (normally auto-pulled on first boot)
	@echo "$(CYAN)▶ Pulling model '$(OLLAMA_MODEL)'…$(RESET)"
	@docker exec $(OLLAMA_CTR) ollama pull $(OLLAMA_MODEL)

list-models: ## List models available inside the Ollama container
	@docker exec $(OLLAMA_CTR) ollama list

# ── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Tail logs from all containers (Ctrl-C to exit)
	@$(COMPOSE) logs -f

logs-api: ## Tail FastAPI logs
	@$(COMPOSE) logs -f $(FASTAPI_CTR)

logs-react: ## Tail React / Nginx logs
	@$(COMPOSE) logs -f react

logs-db: ## Tail PostgreSQL logs
	@$(COMPOSE) logs -f postgres

logs-ollama: ## Tail Ollama logs
	@$(COMPOSE) logs -f $(OLLAMA_CTR)

# ── Status & health ───────────────────────────────────────────────────────────

ps: ## Show running container names and ports
	@$(COMPOSE) ps

status: ## Show container status including health checks
	@echo ""
	@echo "$(BOLD)  Container status$(RESET)"
	@echo ""
	@docker ps --filter "name=fastapi" \
	           --filter "name=keycloak" \
	           --filter "name=ollama" \
	           --filter "name=keycloak_postgres" \
	           --filter "name=mailpit" \
	           --filter "name=react" \
	  --format "  $(CYAN){{.Names}}$(RESET)\t{{.Status}}\t{{.Ports}}" | column -t
	@echo ""

health: ## Quick FastAPI liveness check
	@curl -sf http://localhost:8000/health | python3 -m json.tool \
	  && echo "$(GREEN)✓ FastAPI is healthy$(RESET)" \
	  || echo "$(RED)✗ FastAPI is not responding$(RESET)"

# ── Frontend dev ──────────────────────────────────────────────────────────────

install: ## Install React / Node dependencies
	@echo "$(CYAN)▶ Installing frontend dependencies…$(RESET)"
	@cd $(REACT_DIR) && npm install

dev: ## Start the Vite dev server with HMR (requires containers to be up)
	@echo "$(CYAN)▶ Starting Vite dev server at http://localhost:5173$(RESET)"
	@cd $(REACT_DIR) && npm run dev

# ── Code quality ──────────────────────────────────────────────────────────────

fmt: ## Auto-format Python code with ruff
	@cd fastapi && python -m ruff format .

check: ## Lint Python code with ruff
	@cd fastapi && python -m ruff check .

# ── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "$(BOLD)  python-react-keycloak$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; \
	         /^(up|down|build|restart|reset):/ { group="Lifecycle" } \
	         /^(seed):/ { group="Database" } \
	         /^(pull-model|list-models):/ { group="Ollama" } \
	         /^(logs):/ { group="Logs (all)" } \
	         /^(logs-|ps|status|health):/ { group="Logs / Status" } \
	         /^(dev|install):/ { group="Frontend" } \
	         /^(fmt|check):/ { group="Code quality" } \
	         { printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2 }'
	@echo ""
	@echo "  $(YELLOW)Windows:$(RESET) use $(BOLD).\\make.ps1 <target>$(RESET) in PowerShell"
	@echo ""

.DEFAULT_GOAL := help
