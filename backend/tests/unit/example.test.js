// backend/tests/unit/example.test.js

// Простые юнит-тесты (быстрые, без БД)
describe('Simple math tests', () => {
    test('1 + 1 equals 2', () => {
        expect(1 + 1).toBe(2);
    });

    test('2 * 3 equals 6', () => {
        expect(2 * 3).toBe(6);
    });

    test('10 / 2 equals 5', () => {
        expect(10 / 2).toBe(5);
    });
});

describe('String tests', () => {
    test('string concatenation works', () => {
        expect('Hello ' + 'World').toBe('Hello World');
    });

    test('string length is correct', () => {
        expect('Hello'.length).toBe(5);
    });

    test('string includes substring', () => {
        expect('Hello World').toContain('World');
    });
});

describe('Array tests', () => {
    test('array has correct length', () => {
        const arr = [1, 2, 3];
        expect(arr).toHaveLength(3);
    });

    test('array contains specific value', () => {
        const arr = [1, 2, 3];
        expect(arr).toContain(2);
    });
});