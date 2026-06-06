/**
 * Jest config for the shared engine unit tests.
 * The engines are pure, platform-agnostic TypeScript (no React Native imports),
 * so they run under ts-jest with a plain node environment — no jest-expo needed.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/engine/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { strict: true, esModuleInterop: true, types: ['jest'] } },
    ],
  },
};
