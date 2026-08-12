import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// ========== КОНФИГУРАЦИЯ ==========
const app = express();
const port = process.env.PORT || 5000;

// Подключение к БД
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'todoapp',
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());

// ========== РОУТЫ ==========

// Проверка здоровья
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Получить все задачи
app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: err.message });
    }
});

// Создать задачу
app.post('/api/todos', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO todos (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ error: err.message });
    }
});

// Обновить задачу
app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: err.message });
    }
});

// Удалить задачу
app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: err.message });
    }
});

// ========== ЗАПУСК ==========
app.listen(port, () => {
    console.log(`🚀 Backend running on port ${port}`);
    console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

// ========== ИНИЦИАЛИЗАЦИЯ БД ==========
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Database init error:', err);
    }
};

initDB();