import { test, expect } from '@playwright/test';

/**
 * Cờ tắt (bản build mặc định của e2e): không nút, không request ra ngoài, không
 * storage của tính năng, và `?code=` lạ không bị đụng tới (ADR-0010).
 */

test('no sign-in button and no request outside the app origin', async ({ page, baseURL }) => {
  const outside: string[] = [];
  page.on('request', (r) => {
    // Font Google là chuyện có từ trước, không thuộc tính năng này.
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:') && !r.url().includes('fonts.g')) {
      outside.push(r.url());
    }
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^CHƠI/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tài khoản Ducker ID' })).toHaveCount(0);
  expect(outside).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.getItem('ducker.pkce'))).toBeNull();
});

test('the auth module leaves the URL alone when the flag is off', async ({ page }) => {
  await page.goto('/?code=abc&state=xyz');
  await expect(page.getByRole('button', { name: /^CHƠI/ }).first()).toBeVisible();
  expect(new URL(page.url()).search).toBe('?code=abc&state=xyz');
});
