.PHONY: dev test lint migrate docker worker

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

worker:
	arq arq_worker.WorkerSettings

test:
	pytest --cov=app --cov-report=term-missing -v

lint:
	ruff check app/
	mypy app/

migrate:
	alembic upgrade head

migration:
	alembic revision --autogenerate -m "$(msg)"

docker:
	docker build -t autotennant-api .
