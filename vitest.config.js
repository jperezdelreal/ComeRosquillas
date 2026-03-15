import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['js/game-logic.js', 'js/config.js', 'js/engine/high-scores.js'],
      exclude: ['js/main.js'],
    },
  },
});
