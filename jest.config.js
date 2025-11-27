module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['lib/**/*.js', 'bin/**/*.js', 'index.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 30,
      lines: 40,
      statements: 40,
    },
  },
  verbose: true,
  testTimeout: 10000,
};
