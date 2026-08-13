// backend/src/db.js
import pkg from 'pg';
const { Pool } = pkg;

// ============ ПОДКЛЮЧЕНИЕ К БД ============
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'todoapp',
    // Настройки пула соединений
    max: 20,                    // Максимум соединений
    idleTimeoutMillis: 30000,   // Закрыть неиспользуемые через 30 сек
    connectionTimeoutMillis: 2000, // Таймаут подключения 2 сек
});

// ============ ПРОВЕРКА ПОДКЛЮЧЕНИЯ ============
const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
};

// ============ ИНИЦИАЛИЗАЦИЯ БД ============
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Database init error:', err);
        throw err;
    }
};

// ============ ЭКСПОРТ ============
export { pool, testConnection, initDB };