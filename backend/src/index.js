// backend/src/index.js
import express from 'express';
import cors from 'cors';
import {
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo
} from './todos.js';
import { testConnection, initDB } from './db.js';

// ============ КОНФИГУРАЦИЯ ============
const app = express();
const port = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());

// ============ РОУТЫ ============

// Проверка здоровья
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Получить все задачи
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await getAllTodos();
        res.json(todos);
    } catch (err) {
        console.error('Error in GET /api/todos:', err);
        res.status(500).json({ error: err.message });
    }
});

// Получить задачу по ID
app.get('/api/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        
        const todo = await getTodoById(id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (err) {
        console.error('Error in GET /api/todos/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// Создать задачу
app.post('/api/todos', async (req, res) => {
    try {
        const { title } = req.body;
        const todo = await createTodo(title);
        res.status(201).json(todo);
    } catch (err) {
        console.error('Error in POST /api/todos:', err);
        if (err.message.includes('Title')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

// Обновить задачу
app.put('/api/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        
        const todo = await updateTodo(id, req.body);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (err) {
        console.error('Error in PUT /api/todos/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// Удалить задачу
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        
        const todo = await deleteTodo(id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted', todo });
    } catch (err) {
        console.error('Error in DELETE /api/todos/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ЗАПУСК ============
const startServer = async () => {
    try {
        // Проверяем подключение к БД
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ Cannot start server without database');
            process.exit(1);
        }
        
        // Инициализируем БД
        await initDB();
        
        // Запускаем сервер
        app.listen(port, () => {
            console.log(`🚀 Backend running on port ${port}`);
            console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

// Экспортируем app для тестов
export { app };

// Запускаем только если не в тестовом режиме
if (process.env.NODE_ENV !== 'test') {
    startServer();
}