##@ Deploy

PROD_COMPOSE = docker compose -f build/docker-compose.prod.yml --env-file build/.env

.PHONY: deploy deploy-build deploy-logs deploy-logs-server deploy-logs-client deploy-logs-caddy deploy-ps deploy-stop deploy-restart deploy-down deploy-clean deploy-db-backup deploy-db-shell deploy-shell-server

deploy: ## Build and start all production services
	@$(PROD_COMPOSE) up -d --build

deploy-build: ## Rebuild all production images without cache
	@$(PROD_COMPOSE) build --no-cache

deploy-logs: ## Follow logs for all production services
	@$(PROD_COMPOSE) logs -f

deploy-logs-server: ## Follow server logs only
	@$(PROD_COMPOSE) logs -f server

deploy-logs-client: ## Follow client logs only
	@$(PROD_COMPOSE) logs -f client

deploy-logs-caddy: ## Follow Caddy logs only
	@$(PROD_COMPOSE) logs -f caddy

deploy-ps: ## Show status of production containers
	@$(PROD_COMPOSE) ps

deploy-stop: ## Stop all production services (keeps containers)
	@$(PROD_COMPOSE) stop

deploy-restart: ## Restart all production services
	@$(PROD_COMPOSE) restart

deploy-down: ## Stop and remove all production containers
	@$(PROD_COMPOSE) down

deploy-clean: ## Stop containers and wipe volumes (DESTRUCTIVE — deletes DB data)
	@echo "⚠️  This will DELETE all data including the database!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(PROD_COMPOSE) down -v

deploy-db-backup: ## Create a timestamped Postgres backup
	@mkdir -p backups
	@$(PROD_COMPOSE) exec postgres pg_dump -U $${POSTGRES_USER:-dimewise} $${POSTGRES_DB:-dimewise} > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup saved to backups/"

deploy-db-shell: ## Open psql shell in the production Postgres container
	@$(PROD_COMPOSE) exec postgres psql -U $${POSTGRES_USER:-dimewise} $${POSTGRES_DB:-dimewise}

deploy-shell-server: ## Open shell in the production server container
	@$(PROD_COMPOSE) exec server sh

deploy-prune: ## Remove unused Docker images and build cache
	@docker system prune -af
