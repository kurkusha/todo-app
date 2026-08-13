export default {
    // Среда выполнения
    testEnvironment: 'node',
    
    // Файлы для настройки
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Откуда собирать покрытие
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/migrate.js',
        '!src/**/*.test.js',
        '!**/node_modules/**'
    ],
    
    // Пороги покрытия
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    
    // Форматы отчетов
    coverageReporters: ['text', 'lcov', 'cobertura'],
    
    // Таймаут
    testTimeout: 10000,
    
    // Игнорируемые пути
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    
    // Трансформация через Babel
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Расширения файлов
    moduleFileExtensions: ['js', 'json'],
    
    // Поддержка ESM
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    
    // Включить verbose вывод
    verbose: true,
    
    // Сброс модулей между тестами
    resetModules: true,
    
    // Очистка между тестами
    clearMocks: true
};
