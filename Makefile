# Makefile for Docker operations

# Variables
APP_NAME=verifier-app
DEV_IMAGE=$(APP_NAME):dev
PROD_IMAGE=$(APP_NAME):prod

# Development commands
.PHONY: dev-build dev-run dev-stop dev-logs

dev-build:
	docker build -f Dockerfile.dev -t $(DEV_IMAGE) .

dev-run:
	docker-compose -f docker-compose.dev.yml up -d

dev-stop:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-shell:
	docker-compose -f docker-compose.dev.yml exec app-dev sh

# Production commands
.PHONY: prod-build prod-run prod-stop prod-logs

prod-build:
	docker build -f Dockerfile.prod -t $(PROD_IMAGE) .

prod-run:
	docker-compose -f docker-compose.prod.yml up -d

prod-stop:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-shell:
	docker-compose -f docker-compose.prod.yml exec app-prod sh

# Utility commands
.PHONY: clean clean-all

clean:
	docker image prune -f
	docker container prune -f

clean-all:
	docker system prune -af
	docker volume prune -f

# Health check
.PHONY: health

health:
	curl -f http://localhost/health || echo "Health check failed"

# Help
.PHONY: help

help:
	@echo "Available commands:"
	@echo "  dev-build    - Build development image"
	@echo "  dev-run      - Run development container"
	@echo "  dev-stop     - Stop development container"
	@echo "  dev-logs     - Show development logs"
	@echo "  dev-shell    - Access development container shell"
	@echo ""
	@echo "  prod-build   - Build production image"
	@echo "  prod-run     - Run production container"
	@echo "  prod-stop    - Stop production container"
	@echo "  prod-logs    - Show production logs"
	@echo "  prod-shell   - Access production container shell"
	@echo ""
	@echo "  clean        - Clean unused Docker resources"
	@echo "  clean-all    - Clean all Docker resources (careful!)"
	@echo "  health       - Check application health"