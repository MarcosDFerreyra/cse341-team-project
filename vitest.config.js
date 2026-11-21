import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.js'],
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    hookTimeout: 120_000,
    // app.js needs a session secret; tests use a fake one.
    env: { SESSION_SECRET: 'test-session-secret' }
  }
});
