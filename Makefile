.PHONY: help dev prod stop logs clean shell-db shell-backend shell-frontend

help:
	@echo "📋 Доступные команды:"
	@echo "  make dev          - Запустить в режиме разработки"
	@echo "  make prod         - Собрать и запустить в продакшене"
	@echo "  make stop         - Остановить все контейнеры"
	@echo "  make logs         - Показать логи всех сервисов"
	@echo "  make clean        - Полная очистка"
	@echo "  make shell-db     - Войти в контейнер БД"
	@echo "  make shell-backend- Войти в контейнер бэкенда"
	@echo "  make shell-frontend- Войти в контейнер фронтенда"

dev:
	@echo "🚀 Запуск в режиме разработки..."
	BUILD_TARGET=development docker compose up --build

prod:
	@echo "🚀 Запуск в продакшене..."
	BUILD_TARGET=production docker compose up -d --build

stop:
	@echo "🛑 Остановка контейнеров..."
	docker compose down

logs:
	docker compose logs -f

clean:
	@echo "🧹 Полная очистка..."
	docker compose down -v --remove-orphans
	docker system prune -f

shell-db:
	docker compose exec db psql -U $(DB_USER) $(DB_NAME)

shell-backend:
	docker compose exec backend /bin/sh

shell-frontend:
	docker compose exec frontend /bin/sh

status:
	docker compose ps
	@echo "\n📊 Использование ресурсов:"
	docker stats --no-stream