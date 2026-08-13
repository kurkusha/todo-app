// backend/tests/setup.js
import { pool } from '../src/db.js';

// Перед всеми тестами
beforeAll(async () => {
    try {
        // Создаем таблицы для тестов
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                priority INTEGER DEFAULT 1,
                due_date DATE,
                tags TEXT[] DEFAULT '{}'
            )
        `);
        console.log('✅ Test database initialized');
    } catch (err) {
        console.error('❌ Test database init error:', err);
        throw err;
    }
});

// После каждого теста
afterEach(async () => {
    try {
        // Очищаем таблицу после каждого теста
        await pool.query('TRUNCATE todos RESTART IDENTITY CASCADE');
    } catch (err) {
        console.error('❌ Test cleanup error:', err);
    }
});

// После всех тестов
afterAll(async () => {
    try {
        await pool.end();
        console.log('✅ Test database closed');
    } catch (err) {
        console.error('❌ Test close error:', err);
    }
});

export { pool };