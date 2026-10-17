import { test, type Page } from '@playwright/test';

const towerCard = (page: Page, name: string) =>
  page.getByTestId('tower-cards').getByRole('button', { name });

test('chup tran dang chay', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();
  await page.waitForTimeout(600);

  for (const [slot, tower] of [
    ['Ô số 8', 'Cung'], ['Ô số 9', 'Pháo'], ['Ô số 3', 'Băng'],
  ] as const) {
    await page.getByRole('button', { name: slot }).click();
    await towerCard(page, tower).click();
    await page.getByRole('button', { name: /^XÂY · / }).click();
    await page.waitForTimeout(150);
  }

  await page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ }).click();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: 'test-results/look/battle-running-1440.png' });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test-results/look/battle-running-375.png' });
});
