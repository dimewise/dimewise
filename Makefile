default: help

include makefiles/base.mk
include makefiles/init.mk
include makefiles/runner.mk
include makefiles/generator.mk
include makefiles/database.mk
include makefiles/docker.mk
include makefiles/eas.mk
include makefiles/utility.mk

MAKEFLAGS += --no-print-directory

.PHONY: help
help: ## Show a list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

