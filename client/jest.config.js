module.exports = {
    moduleNameMapper: {
        '^@client(.*)': '<rootDir>/$1',
        '^@components(.*)': '<rootDir>/components/$1',
        '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/__mocks__/fileMock.js'
    },
    setupFiles: ['core-js'],
    setupFilesAfterEnv: ['<rootDir>/tests/util/jestSuiteSetup.js'],
    globalSetup: '<rootDir>/tests/util/jestGlobalSetup.js',
    globalTeardown: '<rootDir>/tests/util/jestGlobalTeardown.js',
    testEnvironment: '<rootDir>/tests/util/jestPuppeteer.js',
    testTimeout: 60000,
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest'
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/resources/'],
    coveragePathIgnorePatterns: ['<rootDir>/resources/']
};
