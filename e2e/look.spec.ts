import { test, expect } from '@playwright/test';

/**
 * Không phải test kiểm định — đây là bước "nhìn app đang chạy" của
 * `feature-flow` §5: một UI chưa nhìn thì chưa xong. Nó chụp ảnh mọi màn ở mọi
 * mốc để người thật xem, và chỉ khẳng định đúng một thứ mà máy kiểm được:
 * KHÔNG CUỘN NGANG (FR-30).
 */
const VIEWPORTS = [
  { name: '375-portrait', width: 375, height: 812 },
  { name: '375-landscape', width: 812, height: 375 },
  { name: '768-portrait', width: 768, height: 1024 },
  { name: '1024-landscape', width: 1024, height: 768 },
  { name: '1440-desktop', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`chụp mọi màn ở ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    const shots: [string, () => Promise<void>][] = [
      ['title', async () => {}],
      ['maps', async () => { await page.getByRole('button', { name: /Chọn bản đồ/ }).first().click(); }],
      ['workshop', async () => {
        await page.getByRole('button', { name: /Quay lại/ }).first().click();
        await page.getByRole('button', { name: /Xưởng nâng cấp/ }).first().click();
      }],
      ['settings', async () => {
        await page.getByRole('button', { name: /Quay lại/ }).first().click();
        await page.getByRole('button', { name: /Cài đặt/ }).first().click();
      }],
      ['battle', async () => {
        await page.getByRole('button', { name: /Quay lại/ }).first().click();
        await page.getByRole('button', { name: /CHƠI/ }).first().click();
        await page.waitForTimeout(1200);
      }],
    ];

    for (const [name, act] of shots) {
      await act();
      await page.waitForTimeout(250);
      await page.screenshot({ path: `test-results/look/${vp.name}-${name}.png` });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${name} cuộn ngang ${overflow}px ở ${vp.name}`).toBeLessThanOrEqual(1);
    }
  });
}
