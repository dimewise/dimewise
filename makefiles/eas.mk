##@ EAS CLI Helpers - Commands to interact with eas-cli

.PHONY: build-ios-dev
build-ios-dev: ## Creates an iOS development build on EAS platform
	@echo "Starting iOS development build..."
	@cd ./mobile && eas build --platform ios --profile development

.PHONY: build-ios-prod
build-ios-prod: ## Creates an iOS production build on EAS platform
	@echo "Starting iOS production build..."
	@cd ./mobile && eas build --platform ios --profile production

.PHONY: submit-ios
submit-ios: ## Submits the iOS build to TestFlight through EAS platform
	@echo "Submitting to TestFlight..."
	@cd ./mobile && eas submit --platform ios
