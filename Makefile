.PHONY: build up down logs clean restart

# Build the Docker image
build:
	docker compose build

# Start the application
up:
	docker compose up -d

# Stop the application
down:
	docker compose down

# View logs
logs:
	docker compose logs -f

# Clean up containers and volumes
clean:
	docker compose down -v
	docker system prune -f

# Restart the application
restart: down up

# Development mode (with logs)
dev:
	docker compose up

# Check status
status:
	docker compose ps

# Open the application in browser (Linux)
open:
	xdg-open http://localhost:5173