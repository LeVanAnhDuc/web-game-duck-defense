import { defineConfig, devices } from '@playwright/test';

/**
 * NFR-I18N-04 và FR-30 đòi kiểm ở CẢ HAI locale và ở bốn mốc bề rộng, cả hai
 * chiều xoay. Bề rộng được đặt trong từng test (một test đi qua nhiều mốc), nên
 * ở đây chỉ khai một project.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5273',
    trace: 'retain-on-failure',
  },
  // Cổng 5273, không phải 5173 mặc định của Vite: workspace này có nhiều dự án
  // Vite và `CLAUDE.md` ở gốc đã ghi lại một lần đụng cổng làm e2e của dự án này
  // chạy vào app của dự án khác. Cổng riêng + `strictPort` để nếu đụng thì nó
  // BÁO LỖI thay vì âm thầm nhảy cổng.
  webServer: {
    command: 'npx vite --port 5273 --strictPort',
    url: 'http://localhost:5273',
    reuseExistingServer: true,
    stdout: 'pipe',
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
