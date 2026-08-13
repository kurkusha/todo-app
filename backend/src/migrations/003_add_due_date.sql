-- 003_add_due_date.sql
-- Добавляем дату выполнения

-- Добавляем колонку due_date (дата выполнения)
ALTER TABLE todos ADD COLUMN due_date DATE;

-- Создаем индекс для due_date
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

-- Добавляем колонку для тегов (массив)
ALTER TABLE todos ADD COLUMN tags TEXT[] DEFAULT '{}';