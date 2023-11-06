default: help

include .env

OPENAPI_SERVER_SPEC=../openapi/oapi-spec.yaml
OPENAPI_SERVER_GEN_CONFIG=./oapi/codegen.yaml

.PHONY: build run clean help
deps:
	cd ./server
	go mod download 

## Builts binaries for darwin, linux, and windows
build:
	cd ./server
	GOARCH=amd64 GOOS=darwin go build -o ./dist/${BINARY_NAME}-darwin main.go
	GOARCH=amd64 GOOS=linux go build -o ./dist/${BINARY_NAME}-linux main.go
	GOARCH=amd64 GOOS=windows go build -o ./dist/${BINARY_NAME}-windows main.go

## Runs binaries of local OS
run: build
	./server/dist/${BINARY_NAME}

## Removes all built binaries
clean:
	go clean
	rm -rf ./server/dist

## Display available targets
help:
	@printf "Available targets:\n\n"
	@awk '/^[a-zA-Z\\-\\_0-9%:\\]+/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = $$1; \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			gsub("\\\\", "", helpCommand); \
			gsub(":+$$", "", helpCommand); \
			printf "  \033[32;01m%-35s\033[0m %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST) | sort -u
	@printf "\n"

.PHONY: docker/up docker/down docker/rebuild
docker-deps: 
	@which go

## Starts docker containers
docker/up: docker-deps
	@docker compose up -d --remove-orphans 

## Stops and removes docker containers
docker/down: docker-deps
	@docker compose down

## Rebuilds docker containers
docker/rebuild: docker-deps
	@docker compose down 
	@docker compose up -d --build 

.PHONY: init/deps
## Initialize golang dependencies
init/deps:
	cd server && \
	echo "Initializing server dependencies..."; \
	if [ ! -d bin ]; then \
		echo "Directory bin/ does not exist, creating bin/"; \
		mkdir bin; \
	fi; \
	export GOBIN=${PWD}/server/bin; \
	while read -r line; do \
		exec=$$(basename $$line); \
		exec=$${exec%%@*}; \
		if [ ! -f $${GOBIN}/$$exec ]; then \
			echo "Installing tool $$exec"; \
			go install $$line; \
		fi; \
	done < tools.txt; \
	cd ../web && \
	echo "Initializing web dependencies..."; \
	yarn

.PHONY: gen/oapi
## Generate code for server and web based on OpenAPI specification
gen/oapi:
	@cd server && \
	echo "Generating for server..."; \
	./bin/oapi-codegen -config ${OPENAPI_SERVER_GEN_CONFIG} ${OPENAPI_SERVER_SPEC}; \
	cd ../web && \
	echo "Generating for web..."; \
	yarn gen:oapi

.PHONY: db/init db/refresh db/migration/up db/migration/down db/migration/create
## Initialize database
db/init:
	@echo "Recreating database: $(DATABASE_NAME)"; 
	@docker compose exec dw_db psql -U postgres -c "DROP DATABASE IF EXISTS \"$(DATABASE_NAME)\" WITH (FORCE);"
	@docker compose exec dw_db psql -U postgres -c "CREATE DATABASE \"$(DATABASE_NAME)\" ;"

## Recreate database
db/refresh:
	make db/init
	make db/migration/up

## Migrate existing migrations
db/migration/up:
	@cd server && \
	./bin/goose -dir db/migration postgres $(DATABASE_URL) up

## Rollback existing migrations
db/migration/down:
	@cd server && \
	./bin/goose -dir db/migration postgres $(DATABASE_URL) down

## Tool for creating goose migration
db/migration/create: 
	@cd server && \
	./bin/goose -s -dir db/migration create "$(NAME)" sql
