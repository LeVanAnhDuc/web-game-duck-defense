import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Alias @/ phai khai o BA cho trong repo nay: tsconfig.json (cho tsc),
  // vite.config.ts (cho build va dev) va day (cho Vitest). Thieu cho nay thi
  // test nao import mot view se khong resolve duoc, va loi chi hien luc co nguoi
  // viet test dau tien cho tang view.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // Mặc định Node cho nhanh. File nào cần localStorage thì tự khai ở đầu file:
    //   // @vitest-environment jsdom
    environment: 'node',
  },
});
