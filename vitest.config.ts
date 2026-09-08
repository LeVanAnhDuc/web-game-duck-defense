import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Mặc định Node cho nhanh. File nào cần localStorage thì tự khai ở đầu file:
    //   // @vitest-environment jsdom
    environment: 'node',
  },
});
