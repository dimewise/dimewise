##@ Docker - Commands to interface with docker compose

.PHONY: docker-up
docker-up: ## Runs docker-compose up -d (detached mode)
	@cd ./server && docker-compose up -d

.PHONY: docker-up-live
docker-up-live: ## Runs docker-compose up (foreground)
	@cd ./server && docker-compose up

.PHONY: docker-stop
docker-stop: ## Stops running containers without removing them
	@cd ./server && docker-compose stop

.PHONY: docker-down
docker-down: ## Stops and removes containers, networks, images, and volumes
	@cd ./server && docker-compose down

.PHONY: docker-logs
docker-logs: ## Shows logs from all containers
	@cd ./server && docker-compose logs -f

.PHONY: docker-shell
docker-shell: ## Opens a shell in the main container (adjust container name accordingly)
	@cd ./server && docker-compose exec app /bin/sh

.PHONY: docker-restart
docker-restart: ## Restart all containers
	@cd ./server && docker-compose restart
