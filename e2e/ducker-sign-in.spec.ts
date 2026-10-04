import { test, expect } from '@playwright/test';

/**
 * Ducker ID sign-in (ADR-0010) với bản build bật cờ + issuer GIẢ `http://ducker.test`.
 * Chạy ở project `ducker-sign-in` (cổng 5275, xem playwright.config.ts). Mọi request
 * tới issuer đều bị `page.route` chặn — nó không bao giờ được phân giải thật.
 */

const ISSUER = 'http://ducker.test';
const CORS = { 'access-control-allow-origin': '*' };

test.beforeEach(async ({ page }) => {
  await page.route(`${ISSUER}/oauth/authorize**`, async (route) => {
    const url = new URL(route.request().url());
    const back = new URL(url.searchParams.get('redirect_uri')!);
    back.searchParams.set('code', 'code-1');
    back.searchParams.set('state', url.searchParams.get('state')!);
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await page.route(`${ISSUER}/oauth/token`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ access_token: 'at-1', token_type: 'Bearer', expires_in: 900 }),
    }),
  );
  await page.route(`${ISSUER}/oauth/userinfo`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ sub: 'u1', name: 'Lê Văn Anh Đức', email: 'duc@ducker.id' }),
    }),
  );
});

test('signs in, shows the name, keeps the URL clean, signs out', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  const account = page.getByRole('button', { name: 'Tài khoản Ducker ID' });
  await expect(account).toBeVisible();
  expect(new URL(page.url()).search).not.toMatch(/code=|state=/);

  await account.click();
  await expect(page.getByText('Lê Văn Anh Đức').first()).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Mở hồ sơ Ducker ID' })).toHaveAttribute(
    'href',
    `${ISSUER}/profile`,
  );

  await page.keyboard.press('Escape');
  await expect(account).toBeFocused();

  await account.click();
  await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeFocused();
  expect(errors).toEqual([]);
});

test('reload while signed in goes back to signed out (nothing persisted)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('button', { name: 'Tài khoản Ducker ID' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
});

test('a tampered state degrades to signed-out and cleans the URL', async ({ page }) => {
  await page.goto('/?code=stolen&state=evil');
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
});

test('an IdP error degrades to signed-out and cleans the URL', async ({ page }) => {
  await page.goto('/?error=access_denied&error_description=nope');
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
});

test('the game still plays while signed in', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('button', { name: 'Tài khoản Ducker ID' })).toBeVisible();
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();
  await expect(page.locator('canvas')).toBeVisible();
});

test('English locale labels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: /English/i }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Ducker ID account' }).click();
  await expect(page.getByRole('menuitem', { name: 'Open Ducker ID profile' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible();
});

test('375px: the button is at least 44x44 and does not overlap the language switch', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/');
  const button = await page.getByRole('button', { name: 'Đăng nhập' }).boundingBox();
  const language = await page.getByRole('radiogroup').first().boundingBox();
  expect(button!.width).toBeGreaterThanOrEqual(44);
  expect(button!.height).toBeGreaterThanOrEqual(44);
  expect(button!.x).toBeGreaterThanOrEqual(language!.x + language!.width);
  expect(button!.x + button!.width).toBeLessThanOrEqual(375);
});

for (const width of [320, 375]) {
  for (const locale of ['vi', 'en'] as const) {
    test(`${width}px ${locale}: top bar does not wrap, language switch stays 44px, menu stays on screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('/');
      if (locale === 'en') await page.getByRole('radio', { name: /English/i }).click();
      const signIn = page.getByRole('button', { name: locale === 'vi' ? 'Đăng nhập' : 'Sign in' });
      const language = page.getByRole('radiogroup').first();
      const bar = language.locator('xpath=..');
      const barSignedOut = await bar.boundingBox();
      const lang0 = await language.boundingBox();
      const signInBox = await signIn.boundingBox();
      expect(Math.abs(signInBox!.y - lang0!.y)).toBeLessThan(8);
      expect(signInBox!.x + signInBox!.width).toBeLessThanOrEqual(width);

      await signIn.click();
      const account = page.getByRole('button', { name: locale === 'vi' ? 'Tài khoản Ducker ID' : 'Ducker ID account' });
      await expect(account).toBeVisible();
      const before = await bar.boundingBox();
      const lang1 = await language.boundingBox();
      expect(before!.height).toBe(barSignedOut!.height);
      expect(lang1!.width).toBeGreaterThanOrEqual(44);
      expect(lang1!.height).toBeGreaterThanOrEqual(44);
      const acct = await account.boundingBox();
      expect(acct!.x).toBeGreaterThanOrEqual(lang1!.x + lang1!.width);
      expect(acct!.x + acct!.width).toBeLessThanOrEqual(width);

      await account.click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      expect(await menu.evaluate((el) => getComputedStyle(el).position)).toBe('absolute');
      const box = await menu.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(await bar.boundingBox()).toEqual(before);
    });
  }
}
