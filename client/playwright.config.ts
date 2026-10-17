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
  webServer: [
    {
      command: 'pnpm exec vite --port 5273 --strictPort',
      url: 'http://localhost:5273',
      reuseExistingServer: true,
      stdout: 'pipe',
      timeout: 120_000,
      // Cờ TẮT một cách tường minh: nếu dev có `.env` bật cờ ở máy thì e2e "cờ tắt"
      // vẫn phải kiểm đúng bản mặc định. Biến trong process.env thắng file `.env`.
      env: { VITE_FEATURE_DUCKER_SIGN_IN: '' },
    },
    // Ducker ID sign-in (ADR-0010): cổng riêng, bật cờ, issuer GIẢ không bao giờ
    // phân giải — mọi request tới nó bị `page.route` chặn trong
    // e2e/ducker-sign-in.spec.ts.
    {
      command: 'pnpm exec vite --port 5275 --strictPort',
      url: 'http://localhost:5275',
      reuseExistingServer: true,
      stdout: 'pipe',
      timeout: 120_000,
      env: {
        VITE_BASE_PATH: '/',
        VITE_FEATURE_DUCKER_SIGN_IN: 'true',
        VITE_DUCKER_ISSUER: 'http://ducker.test',
        VITE_DUCKER_CLIENT_ID: 'e2e-client',
        VITE_DUCKER_SCOPE: 'openid profile email',
        VITE_DUCKER_PROFILE_PATH: '/profile',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      testIgnore: /ducker-sign-in\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ducker-sign-in',
      testMatch: /ducker-sign-in\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5275' },
    },
  ],
});
