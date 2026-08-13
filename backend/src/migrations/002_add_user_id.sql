-- 002_add_user_id.sql
-- Добавляем привязку к пользователю и приоритет

-- Добавляем колонку user_id
ALTER TABLE todos ADD COLUMN user_id INTEGER;

-- Добавляем колонку priority (1 - низкий, 5 - высокий)
ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 1;

-- Создаем индекс для user_id
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Добавляем ограничение для priority (1-5)
ALTER TABLE todos ADD CONSTRAINT check_priority 
    CHECK (priority >= 1 AND priority <= 5);