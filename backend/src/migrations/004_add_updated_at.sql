-- backend/src/migrations/004_add_updated_at.sql
-- Добавляем колонку updated_at
ALTER TABLE todos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновляем существующие записи
UPDATE todos SET updated_at = created_at WHERE updated_at IS NULL;