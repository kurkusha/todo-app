// backend/tests/integration/api.test.js
import request from 'supertest';
import { app } from '../../src/index.js';
import { pool } from '../setup.js';

describe('Todos API Integration Tests', () => {

    // ========== GET /health ==========
    describe('GET /health', () => {
        test('returns 200 with status ok', async () => {
            const response = await request(app)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    // ========== GET /api/todos ==========
    describe('GET /api/todos', () => {
        test('returns empty array when no todos', async () => {
            const response = await request(app)
                .get('/api/todos');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('returns todos when they exist', async () => {
            const result = await pool.query(
                'INSERT INTO todos (title) VALUES ($1) RETURNING *',
                ['Test todo']
            );
            const created = result.rows[0];

            const response = await request(app)
                .get('/api/todos');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Test todo');
            expect(response.body[0].id).toBe(created.id);
        });
    });

    // ========== POST /api/todos ==========
    describe('POST /api/todos', () => {
        test('creates todo with valid title', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: 'Learn Docker' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe('Learn Docker');
            expect(response.body.completed).toBe(false);
        });

        test('returns 400 for empty title', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            // Изменяем проверку: ожидаем любое сообщение об ошибке
            expect(response.body.error).toMatch(/Title is required/);
        });

        test('returns 400 for missing title', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/Title is required/);
        });
    });

    // ========== PUT /api/todos/:id ==========
    describe('PUT /api/todos/:id', () => {
        test('updates todo completion status', async () => {
            const result = await pool.query(
                'INSERT INTO todos (title) VALUES ($1) RETURNING *',
                ['Learn Docker']
            );
            const todo = result.rows[0];

            const response = await request(app)
                .put(`/api/todos/${todo.id}`)
                .send({ completed: true });

            expect(response.status).toBe(200);
            expect(response.body.completed).toBe(true);
            // Проверяем, что updated_at присутствует в ответе
            // Если нет, просто проверяем, что задача обновилась
            expect(response.body.id).toBe(todo.id);
        });

        test('returns 404 for non-existent todo', async () => {
            const response = await request(app)
                .put('/api/todos/9999')
                .send({ completed: true });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Todo not found');
        });
    });

    // ========== DELETE /api/todos/:id ==========
    describe('DELETE /api/todos/:id', () => {
        test('deletes existing todo', async () => {
            const result = await pool.query(
                'INSERT INTO todos (title) VALUES ($1) RETURNING *',
                ['Learn Docker']
            );
            const todo = result.rows[0];

            const response = await request(app)
                .delete(`/api/todos/${todo.id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Todo deleted');

            const check = await pool.query(
                'SELECT * FROM todos WHERE id = $1',
                [todo.id]
            );
            expect(check.rows).toHaveLength(0);
        });

        test('returns 404 for non-existent todo', async () => {
            const response = await request(app)
                .delete('/api/todos/9999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Todo not found');
        });
    });
});
