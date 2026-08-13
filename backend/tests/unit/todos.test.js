// Проверяем логику работы с задачами (без БД)

// Пример: функции для работы с задачами
const todoService = {
    validateTodo: (title) => {
        if (!title) throw new Error('Title is required');
        if (title.length < 3) throw new Error('Title must be at least 3 characters');
        if (title.length > 100) throw new Error('Title must be less than 100 characters');
        return true;
    },
    
    formatTodo: (todo) => {
        return {
            ...todo,
            title: todo.title.trim(),
            created_at: new Date(todo.created_at).toISOString(),
            completed: todo.completed || false
        };
    }
};

describe('Todo Service', () => {
    test('validateTodo throws error for empty title', () => {
        expect(() => todoService.validateTodo('')).toThrow('Title is required');
        expect(() => todoService.validateTodo(null)).toThrow('Title is required');
        expect(() => todoService.validateTodo(undefined)).toThrow('Title is required');
    });
    
    test('validateTodo throws error for short title', () => {
        expect(() => todoService.validateTodo('ab')).toThrow('at least 3 characters');
    });
    
    test('validateTodo throws error for long title', () => {
        const longTitle = 'a'.repeat(101);
        expect(() => todoService.validateTodo(longTitle)).toThrow('less than 100 characters');
    });
    
    test('validateTodo returns true for valid title', () => {
        expect(todoService.validateTodo('Learn Docker')).toBe(true);
        expect(todoService.validateTodo('A'.repeat(3))).toBe(true);
        expect(todoService.validateTodo('A'.repeat(100))).toBe(true);
    });
    
    test('formatTodo trims title', () => {
        const todo = {
            id: 1,
            title: '  Learn Docker  ',
            created_at: '2024-01-15T10:00:00.000Z',
            completed: true
        };
        const formatted = todoService.formatTodo(todo);
        expect(formatted.title).toBe('Learn Docker');
    });
    
    test('formatTodo sets completed to false if not provided', () => {
        const todo = {
            id: 1,
            title: 'Learn Docker',
            created_at: '2024-01-15T10:00:00.000Z'
        };
        const formatted = todoService.formatTodo(todo);
        expect(formatted.completed).toBe(false);
    });
});