.PHONY: dev dev-frontend dev-backend install lint test build docker-up docker-down

# Top-level convenience commands

dev: docker-up
	@echo "Starting all services..."
	$(MAKE) dev-frontend & $(MAKE) dev-backend & wait

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && make dev

install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

lint:
	npx turbo run lint type-check
	cd backend && make lint

test:
	npx turbo run test
	cd backend && make test

build:
	npx turbo run build
	cd backend && make docker

docker-up:
	docker compose up -d redis

docker-down:
	docker compose down
