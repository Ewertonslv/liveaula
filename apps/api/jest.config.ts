import type { Config } from 'jest';
import path from 'path';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  globalSetup: './tests/setup.ts',
  globalTeardown: './tests/teardown.ts',
  testTimeout: 30000,
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../../node_modules')],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          paths: {
            '@liveaula/shared': ['../../packages/shared/src/index.ts'],
          },
        },
      },
    ],
  },
};

export default config;
