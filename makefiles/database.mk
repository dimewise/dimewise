##@ Database - Commands used to interact with the database through Alembic

# .PHONY: db-revision
# db-revision: ## Creates the next empty migration file
# 	cd ./server && venv/bin/alembic revision --autogenerate -m {{.NAME}}
#
# .PHONY: db-upgrade
# db-upgrade: ## Apply unran up migrations
# 	cd ./server && venv/bin/alembic upgrade head
#
# .PHONY: db-downgrade
# db-downgrade: ## Applies down migrations up till the beginning
# 	cd ./server && venv/bin/alembic downgrade base
#
# .PHONY: db-seed
# db-seed: ## Seeds database based on user id
# 	cd ./server && venv/bin/python -m src.utils.seeder {{.USER_ID}}

.PHONY: migration-create
migration-create: ## Creates a sequential migration in the server directory using goose
	@read -p "Enter migration name: " name; \
		cd ./server/db/migrations && go tool goose -s create "$$name" sql
