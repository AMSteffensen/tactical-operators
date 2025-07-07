# 🎮 Tactical Operator - Project Makefile
# Standardized commands for development, testing, and deployment

.PHONY: help install clean build test dev docker lint type-check status
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Project directories
WEB_DIR := web-client
API_DIR := api-server
MOBILE_DIR := mobile-app
SHARED_DIR := shared

## Help
help: ## Show this help message
	@echo "$(BLUE)🎮 Tactical Operator - Development Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?## .*$$/ { \
		if ($$0 ~ /Setup|Install|Clean/) \
			printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST) | sed 's/://g' | sed 's/## //'
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?## .*$$/ { \
		if ($$0 ~ /Development|dev|run|start/) \
			printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST) | sed 's/://g' | sed 's/## //'
	@echo ""
	@echo "$(GREEN)Build & Test:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?## .*$$/ { \
		if ($$0 ~ /build|test|lint|type|check/) \
			printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST) | sed 's/://g' | sed 's/## //'
	@echo ""
	@echo "$(GREEN)Docker & Database:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?## .*$$/ { \
		if ($$0 ~ /docker|db|database/) \
			printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST) | sed 's/://g' | sed 's/## //'

	@echo ""
	@echo "$(GREEN)Utilities:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?## .*$$/ { \
		if ($$0 ~ /status|clean|logs/) \
			printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST) | sed 's/://g' | sed 's/## //'

## Setup & Installation
install: ## Install all dependencies for all packages
	@echo "$(BLUE)📦 Installing all dependencies...$(RESET)"
	@npm install
	@$(MAKE) install-web
	@$(MAKE) install-api
	@$(MAKE) install-mobile
	@$(MAKE) install-shared
	@echo "$(GREEN)✅ All dependencies installed$(RESET)"

install-web: ## Install web client dependencies
	@echo "$(BLUE)📦 Installing web client dependencies...$(RESET)"
	@cd $(WEB_DIR) && npm install

install-api: ## Install API server dependencies
	@echo "$(BLUE)📦 Installing API server dependencies...$(RESET)"
	@cd $(API_DIR) && npm install

install-mobile: ## Install mobile app dependencies
	@echo "$(BLUE)📦 Installing mobile app dependencies...$(RESET)"
	@cd $(MOBILE_DIR) && npm install

install-shared: ## Install shared package dependencies
	@echo "$(BLUE)📦 Installing shared package dependencies...$(RESET)"
	@cd $(SHARED_DIR) && npm install

## Development
dev: ## Start development servers 
	@echo "$(BLUE)🚀 Starting development servers...$(RESET)"
	@npm run dev

dev-traditional: ## Start development servers with concurrently (legacy)
	@echo "$(BLUE)🚀 Starting development servers traditionally...$(RESET)"
	@npm run dev:traditional

dev-full: ## Start full development stack (DB + API + Web)
	@echo "$(BLUE)🚀 Starting full development stack...$(RESET)"
	@npm run dev:full

dev-web: ## Start only web client development server
	@echo "$(BLUE)🌐 Starting web client...$(RESET)"
	@cd $(WEB_DIR) && npm run dev

dev-api: ## Start only API server development server
	@echo "$(BLUE)🔌 Starting API server...$(RESET)"
	@cd $(API_DIR) && npm run dev

dev-mobile: ## Start mobile app development server
	@echo "$(BLUE)📱 Starting mobile app...$(RESET)"
	@cd $(MOBILE_DIR) && npm start

## Build & Test
build: ## Build all packages for production
	@echo "$(BLUE)🔨 Building all packages...$(RESET)"
	@$(MAKE) build-shared
	@$(MAKE) build-api
	@$(MAKE) build-web
	@echo "$(GREEN)✅ All packages built successfully$(RESET)"

build-web: ## Build web client for production
	@echo "$(BLUE)🔨 Building web client...$(RESET)"
	@cd $(WEB_DIR) && npm run build

build-api: ## Build API server for production
	@echo "$(BLUE)🔨 Building API server...$(RESET)"
	@cd $(API_DIR) && npm run build

build-shared: ## Build shared package
	@echo "$(BLUE)🔨 Building shared package...$(RESET)"
	@cd $(SHARED_DIR) && npm run build

test: ## Run all tests
	@echo "$(BLUE)🧪 Running all tests...$(RESET)"
	@$(MAKE) test-web
	@$(MAKE) test-api
	@echo "$(GREEN)✅ All tests completed$(RESET)"

test-web: ## Run web client tests
	@echo "$(BLUE)🧪 Running web client tests...$(RESET)"
	@cd $(WEB_DIR) && npm test

test-api: ## Run API server tests
	@echo "$(BLUE)🧪 Running API server tests...$(RESET)"
	@cd $(API_DIR) && npm test

lint: ## Run linting for all packages
	@echo "$(BLUE)📝 Running linting...$(RESET)"
	@$(MAKE) lint-web
	@$(MAKE) lint-api
	@echo "$(GREEN)✅ Linting completed$(RESET)"

lint-web: ## Run web client linting
	@echo "$(BLUE)📝 Linting web client...$(RESET)"
	@cd $(WEB_DIR) && npm run lint

lint-api: ## Run API server linting
	@echo "$(BLUE)📝 Linting API server...$(RESET)"
	@cd $(API_DIR) && npm run lint

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)🔍 Running TypeScript type checking...$(RESET)"
	@cd $(WEB_DIR) && npx tsc --noEmit
	@cd $(API_DIR) && npx tsc --noEmit
	@cd $(SHARED_DIR) && npx tsc --noEmit
	@echo "$(GREEN)✅ Type checking completed$(RESET)"

type-check-web: ## Run TypeScript type checking for web client
	@echo "$(BLUE)🔍 Type checking web client...$(RESET)"
	@cd $(WEB_DIR) && npx tsc --noEmit

type-check-api: ## Run TypeScript type checking for API server
	@echo "$(BLUE)🔍 Type checking API server...$(RESET)"
	@cd $(API_DIR) && npx tsc --noEmit

## Docker & Database
docker-db: ## Start database with Docker
	@echo "$(BLUE)🐳 Starting database...$(RESET)"
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Database started$(RESET)"

docker-db-down: ## Stop database
	@echo "$(BLUE)🐳 Stopping database...$(RESET)"
	@docker-compose -f docker-compose.dev.yml down

docker-db-logs: ## Show database logs
	@echo "$(BLUE)📋 Database logs:$(RESET)"
	@docker-compose -f docker-compose.dev.yml logs -f postgres

docker-dev: ## Start full development environment with Docker
	@echo "$(BLUE)🐳 Starting development environment...$(RESET)"
	@docker-compose --profile full up -d

docker-dev-down: ## Stop full development environment
	@echo "$(BLUE)🐳 Stopping development environment...$(RESET)"
	@docker-compose down

docker-logs: ## Show all Docker logs
	@echo "$(BLUE)📋 Docker logs:$(RESET)"
	@docker-compose logs -f

docker-build: ## Build Docker images
	@echo "$(BLUE)🔨 Building Docker images...$(RESET)"
	@docker-compose build

## Database Operations
db-migrate: ## Run database migrations
	@echo "$(BLUE)📊 Running database migrations...$(RESET)"
	@cd $(API_DIR) && npm run db:migrate

db-reset: ## Reset database (WARNING: Destroys all data)
	@echo "$(RED)⚠️  WARNING: This will destroy all database data!$(RESET)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@cd $(API_DIR) && npm run db:reset

db-seed: ## Seed database with sample data
	@echo "$(BLUE)🌱 Seeding database...$(RESET)"
	@cd $(API_DIR) && npm run db:seed

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)🎨 Opening Prisma Studio...$(RESET)"
	@cd $(API_DIR) && npx prisma studio

## Utilities
status: ## Check project status and dependencies
	@echo "$(BLUE)📊 Project Status Check$(RESET)"
	@echo ""
	@echo "$(GREEN)Node.js Version:$(RESET)"
	@node --version
	@echo "$(GREEN)NPM Version:$(RESET)"
	@npm --version
	@echo "$(GREEN)Docker Status:$(RESET)"
	@docker --version 2>/dev/null || echo "$(RED)Docker not available$(RESET)"
	@echo "$(GREEN)Project Dependencies:$(RESET)"
	@[ -d node_modules ] && echo "✅ Root dependencies installed" || echo "❌ Root dependencies missing"
	@[ -d $(WEB_DIR)/node_modules ] && echo "✅ Web client dependencies installed" || echo "❌ Web client dependencies missing"
	@[ -d $(API_DIR)/node_modules ] && echo "✅ API server dependencies installed" || echo "❌ API server dependencies missing"
	@[ -d $(SHARED_DIR)/node_modules ] && echo "✅ Shared package dependencies installed" || echo "❌ Shared package dependencies missing"

clean: ## Clean all build artifacts and dependencies
	@echo "$(BLUE)🧹 Cleaning project...$(RESET)"
	@$(MAKE) docker-db-down
	@rm -rf node_modules */node_modules */dist */.next */build .next
	@echo "$(GREEN)✅ Project cleaned$(RESET)"

clean-soft: ## Clean only build artifacts (keep node_modules)
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(RESET)"
	@rm -rf */dist */.next */build .next $(WEB_DIR)/dist $(API_DIR)/dist
	@echo "$(GREEN)✅ Build artifacts cleaned$(RESET)"

logs-web: ## Show web client logs (for dev server)
	@echo "$(BLUE)📋 Web client logs:$(RESET)"
	@cd $(WEB_DIR) && npm run dev --silent

logs-api: ## Show API server logs (for dev server)
	@echo "$(BLUE)📋 API server logs:$(RESET)"
	@cd $(API_DIR) && npm run dev --silent

## Quick Development Commands
quick-start: dev ## Quick start: Start development environment
	@echo "$(GREEN)🚀 Quick start completed!$(RESET)"

quick-build: build test ## Quick build: Build and test all packages
	@echo "$(GREEN)✅ Quick build completed!$(RESET)"

quick-check: type-check lint ## Quick check: Type check and lint all packages
	@echo "$(GREEN)✅ Quick check completed!$(RESET)"

full-reset: clean install docker-db db-migrate ## Full reset: Clean, install, start DB, and migrate
	@echo "$(GREEN)🔄 Full reset completed!$(RESET)"

## Development Shortcuts
fix-build: type-check-web build-web ## Fix web client build issues
	@echo "$(GREEN)🔧 Build fix completed!$(RESET)"

hybrid-test: build-web dev-web ## Test hybrid system after build
	@echo "$(GREEN)🎮 Hybrid system ready for testing!$(RESET)"

## Information
info: ## Show project information
	@echo "$(BLUE)ℹ️  Tactical Operator Project Information$(RESET)"
	@echo ""
	@echo "$(GREEN)Project Structure:$(RESET)"
	@echo "  📁 web-client/    - React + TypeScript + Three.js frontend"
	@echo "  📁 api-server/    - Node.js + Express + Prisma backend"
	@echo "  📁 mobile-app/    - React Native mobile companion"
	@echo "  📁 shared/        - Shared types and utilities"
	@echo "  📁 docs/          - Documentation and guides"
	@echo ""
	@echo "$(GREEN)Key Features:$(RESET)"
	@echo "  🎮 Hybrid RTS + Turn-based combat system"
	@echo "  🌐 Real-time multiplayer with Socket.IO"
	@echo "  🎨 3D tactical view with Three.js"
	@echo "  📱 Mobile companion app"
	@echo "  🗄️  PostgreSQL database with Prisma ORM"
	@echo ""
	@echo "$(GREEN)Quick Commands:$(RESET)"
	@echo "  make quick-start  - Start development environment"
	@echo "  make quick-build  - Build and test everything"
	@echo "  make quick-check  - Type check and lint"
	@echo "  make status       - Check project health"
