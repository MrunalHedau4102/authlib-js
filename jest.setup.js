// Configure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = 'test-secret-key';
process.env.DATABASE_TYPE = 'sqlite';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error and group for debugging test failures
  error: console.error,
  group: console.group,
  groupEnd: console.groupEnd
};
