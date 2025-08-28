##@ Database - Commands used to interact with the database

.PHONY: migration-create
migration-create: ## Creates a sequential migration in the server directory using goose
	@read -p "Enter migration name: " name; \
		cd ./server/db/migrations && go tool goose -s create "$$name" sql

.PHONY: migration-up
migration-up: ## Runs the latest migrations that have yet to be ran
	@$(call use_env,local) \
		&& cd ./server && \
		go tool goose -dir db/migrations postgres "$$DATABASE_URL" up && \
		go tool jet -dsn="$$DATABASE_URL" -schema=public -path=./db
	@$(MAKE) format-server

.PHONY: migration-down
migration-down: ## Rollback database migrations by 1
	@$(call use_env,local) \
		&& cd ./server && \
		go tool goose -dir db/migrations postgres "$$DATABASE_URL" down

.PHONY: migration-status
migration-status: ## Gets the migration status with goose
	@$(call use_env,local) \
		&& cd ./server && \
		go tool goose -dir db/migrations postgres "$$DATABASE_URL" status

.PHONY: database-reset
database-reset: ## Recreates the database (WARNING - This command drops the database)
	@$(call use_env,local) \
		&& cd ./server && \
		docker-compose exec database psql -U postgres -c "DROP DATABASE IF EXISTS $$DATABASE_NAME;" && \
		docker-compose exec database psql -U postgres -c "CREATE DATABASE $$DATABASE_NAME;"
