// backend/src/todos.js
import { pool } from './db.js';

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

// Валидация заголовка задачи
const validateTitle = (title) => {
    if (!title || typeof title !== 'string') {
        throw new Error('Title is required and must be a string');
    }
    if (title.trim().length < 3) {
        throw new Error('Title must be at least 3 characters');
    }
    if (title.trim().length > 100) {
        throw new Error('Title must be less than 100 characters');
    }
    return title.trim();
};

// Форматирование задачи для ответа
const formatTodo = (todo) => {
    return {
        id: todo.id,
        title: todo.title.trim(),
        completed: todo.completed || false,
        createdAt: todo.created_at || todo.createdAt,
        updatedAt: todo.updated_at || todo.updatedAt
    };
};

// ============ CRUD ОПЕРАЦИИ ============

// Получить все задачи
const getAllTodos = async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        return result.rows.map(formatTodo);
    } catch (err) {
        console.error('Error fetching todos:', err);
        throw new Error('Failed to fetch todos');
    }
};

// Получить задачу по ID
const getTodoById = async (id) => {
    try {
        const result = await pool.query(
            'SELECT * FROM todos WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return formatTodo(result.rows[0]);
    } catch (err) {
        console.error(`Error fetching todo ${id}:`, err);
        throw new Error('Failed to fetch todo');
    }
};

// Создать новую задачу
const createTodo = async (title) => {
    const validatedTitle = validateTitle(title);
    
    try {
        const result = await pool.query(
            'INSERT INTO todos (title) VALUES ($1) RETURNING *',
            [validatedTitle]
        );
        return formatTodo(result.rows[0]);
    } catch (err) {
        console.error('Error creating todo:', err);
        throw new Error('Failed to create todo');
    }
};

// Обновить задачу
const updateTodo = async (id, updates) => {
    try {
        // Проверяем, существует ли задача
        const existing = await getTodoById(id);
        if (!existing) {
            return null;
        }
        
        // Строим запрос динамически
        const fields = [];
        const values = [];
        let query = 'UPDATE todos SET ';
        
        if (updates.title !== undefined) {
            const validatedTitle = validateTitle(updates.title);
            fields.push(`title = $${values.length + 1}`);
            values.push(validatedTitle);
        }
        
        if (updates.completed !== undefined) {
            fields.push(`completed = $${values.length + 1}`);
            values.push(updates.completed);
        }
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        
        // Добавляем updated_at
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        
        query += fields.join(', ');
        query += ` WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);
        
        const result = await pool.query(query, values);
        return formatTodo(result.rows[0]);
    } catch (err) {
        console.error(`Error updating todo ${id}:`, err);
        throw new Error('Failed to update todo');
    }
};

// Удалить задачу
const deleteTodo = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return formatTodo(result.rows[0]);
    } catch (err) {
        console.error(`Error deleting todo ${id}:`, err);
        throw new Error('Failed to delete todo');
    }
};

// ============ ЭКСПОРТ ============
export {
    validateTitle,
    formatTodo,
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo
};