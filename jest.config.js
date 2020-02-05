module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resetMocks: false,
  setupFilesAfterEnv: [require.resolve('expect-more-jest')],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
};
