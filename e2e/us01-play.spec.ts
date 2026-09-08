import { test, expect, type Page } from '@playwright/test';

/**
 * US-01 — đi hết vòng chơi trong trình duyệt thật.
 *
 * Test này chứng minh phần mà `tests/balance/` KHÔNG kiểm được: dây nối giữa
 * React, `bridge/` và Phaser. Nó cố ý KHÔNG chơi hết 12 đợt — `runBattle`
 * headless đã làm việc đó tốt hơn, trong 200ms, và không phụ thuộc trình duyệt.
 * Ở đây chỉ cần: xây được, gọi đợt được, enemy chết ra tiền, và đợt tăng.
 */

const gold = async (page: Page): Promise<number> => {
  const label = await page.getByRole('group', { name: /^Vàng/ }).first().getAttribute('aria-label');
  return Number((label ?? '').replace(/\D+/g, ''));
};

const waveText = (page: Page) => page.getByRole('progressbar', { name: /Đợt|Wave/ }).first();

/**
 * Thẻ chọn loại tháp trong panel xây.
 *
 * Khoanh vùng trong `tower-cards` thay vì tìm theo tên trên cả trang: nhãn của
 * nút Ô trên lớp overlay cũng chứa tên tháp ("Pháo bậc 1 ở ô số 9"), nên
 * Playwright strict mode báo hai kết quả — và nó báo đúng.
 */
const towerCard = (page: Page, name: string) =>
  page.getByTestId('tower-cards').getByRole('button', { name });

async function enterBattle(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('group', { name: /^Vàng/ }).first()).toBeVisible();
}

test('xây tháp trừ đúng tiền, và một lần chạm ô không bao giờ tự xây', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  expect(await gold(page)).toBe(260);

  // Chạm ô: CHỈ chọn, không xây (US-01 §Điều gì có thể sai).
  await page.getByRole('button', { name: 'Ô số 8' }).click();
  expect(await gold(page)).toBe(260);

  // Thao tác thứ hai mới xây.
  await towerCard(page, 'Cung').click();
  await expect.poll(() => gold(page)).toBe(200);
});

test('không đủ tiền thì thẻ tháp bị vô hiệu hoá, không phải im lặng', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  // Tiêu gần hết: 260 → xây hai Pháo (110 mỗi cái) còn 40.
  for (const slot of ['Ô số 8', 'Ô số 9']) {
    await page.getByRole('button', { name: slot }).click();
    await towerCard(page, 'Pháo').click();
  }
  await expect.poll(() => gold(page)).toBe(40);

  await expect(towerCard(page, 'Pháo')).toBeDisabled();
  await expect(towerCard(page, 'Cung')).toBeDisabled();
});

test('gọi đợt: enemy ra, bị bắn, chết ra tiền, rồi sang đợt 2', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  // Ba tháp quanh đoạn đầu đường để đợt 1 chắc chắn bị diệt sạch.
  for (const slot of ['Ô số 8', 'Ô số 9', 'Ô số 3']) {
    await page.getByRole('button', { name: slot }).click();
    await towerCard(page, 'Cung').click();
  }

  const goldAfterBuilding = await gold(page);
  await page.getByRole('radio', { name: 'x3' }).click();
  await page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ }).click();

  // Enemy chết trả tiền, nên tiền phải VƯỢT mức sau khi xây.
  await expect.poll(() => gold(page), { timeout: 60_000, intervals: [500] }).toBeGreaterThan(
    goldAfterBuilding,
  );

  // Đợt 1 xong thì thanh tiến độ nhích lên.
  await expect
    .poll(async () => Number((await waveText(page).getAttribute('aria-valuenow')) ?? '0'), {
      timeout: 60_000,
      intervals: [500],
    })
    .toBeGreaterThanOrEqual(1);

  // Và không mất mạng nào ở đợt 1 với ba tháp — nếu mất, cân bằng đã lệch.
  const lives = await page.getByRole('group', { name: /^Mạng/ }).first().getAttribute('aria-label');
  expect(Number((lives ?? '').replace(/\D+/g, ''))).toBe(20);
});

test('bán tháp trả lại tiền, và ô đó xây lại được', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();
  await expect.poll(() => gold(page)).toBe(200);

  await page.getByRole('button', { name: /^Bán/ }).click();
  await expect.poll(() => gold(page)).toBe(230); // nửa của 60, làm tròn xuống

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();
  await expect.poll(() => gold(page)).toBe(170);
});
