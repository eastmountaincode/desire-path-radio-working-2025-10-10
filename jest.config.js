const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Path to your Next.js app
    dir: './',
});

const customJestConfig = {
    // Load setup file after the test framework is installed in the environment
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Ensure Jest can resolve your module aliases correctly
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // 🟢 Use jsdom, not node — this simulates a browser environment
    testEnvironment: 'jest-environment-jsdom',

    // You can keep your test matching pattern as is
    testMatch: [
        '<rootDir>/**/__tests__/**/*.(js|jsx|ts|tsx)',
        '<rootDir>/**/*.(test|spec).(js|jsx|ts|tsx)',
    ],

    // Collect coverage from components and logic, skip layout/page boilerplate
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/layout.tsx',
        '!app/**/page.tsx',
    ],

    // Optional but recommended: ignore node_modules and .next folders
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
         '<rootDir>/node_modules/',
         '/\\._', // correct way to ignore ._ files
        ],
};

// Export as required by Next.js Jest helper
module.exports = createJestConfig(customJestConfig);
