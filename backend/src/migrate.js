// backend/src/migrate.js
import { pool, testConnection } from './db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ КОНФИГУРАЦИЯ ============
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

// Создать таблицу миграций, если её нет
const createMigrationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Migrations table ready');
};

// Получить список выполненных миграций
const getExecutedMigrations = async () => {
    const result = await pool.query(
        'SELECT name FROM migrations ORDER BY id'
    );
    return result.rows.map(row => row.name);
};

// Получить список файлов миграций
const getMigrationFiles = async () => {
    try {
        const files = await fs.readdir(MIGRATIONS_DIR);
        return files
            .filter(f => f.endsWith('.sql'))
            .sort(); // Сортировка по имени (001, 002, ...)
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.warn(`⚠️  Migrations directory not found: ${MIGRATIONS_DIR}`);
            return [];
        }
        throw err;
    }
};

// Выполнить миграцию
const executeMigration = async (filename, sql) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Выполняем SQL
        await client.query(sql);
        
        // Записываем в таблицу миграций
        await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [filename]
        );
        
        await client.query('COMMIT');
        console.log(`✅ Applied migration: ${filename}`);
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Migration failed: ${filename}`, err.message);
        throw err;
    } finally {
        client.release();
    }
};

// ============ ОСНОВНАЯ ФУНКЦИЯ ============

const runMigrations = async () => {
    console.log('🔄 Starting migrations...');
    
    try {
        // 1. Проверяем подключение к БД
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Cannot connect to database');
        }
        
        // 2. Создаем таблицу миграций
        await createMigrationsTable();
        
        // 3. Получаем список выполненных миграций
        const executed = await getExecutedMigrations();
        console.log(`📋 Executed migrations: ${executed.length}`);
        
        // 4. Получаем список файлов
        const files = await getMigrationFiles();
        console.log(`📁 Found migration files: ${files.length}`);
        
        if (files.length === 0) {
            console.log('ℹ️  No migration files found');
            return;
        }
        
        // 5. Выполняем новые миграции
        let executedCount = 0;
        for (const filename of files) {
            if (executed.includes(filename)) {
                console.log(`⏭️  Skipping ${filename} (already executed)`);
                continue;
            }
            
            console.log(`🔄 Applying ${filename}...`);
            const sql = await fs.readFile(
                path.join(MIGRATIONS_DIR, filename),
                'utf8'
            );
            await executeMigration(filename, sql);
            executedCount++;
        }
        
        if (executedCount === 0) {
            console.log('✅ All migrations are up to date');
        } else {
            console.log(`✅ Applied ${executedCount} new migrations`);
        }
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

// ============ ЗАПУСК ============
runMigrations();