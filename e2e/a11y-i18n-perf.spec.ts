import { test, expect, type Page } from '@playwright/test';

const gold = async (page: Page): Promise<number> => {
  const label = await page.getByRole('group', { name: /^Vàng|^Gold/ }).first().getAttribute('aria-label');
  return Number((label ?? '').replace(/\D+/g, ''));
};

async function enterBattle(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /^CHƠI|^PLAY/ }).first().click();
  await expect(page.getByRole('group', { name: /^Vàng|^Gold/ }).first()).toBeVisible();
}

/* ── NFR-A11Y-02 · FR-29 ─────────────────────────────────────────────────── */

test('đặt được tháp CHỈ bằng bàn phím, và focus luôn thấy được', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);
  expect(await gold(page)).toBe(260);

  // Chọn trước loại tháp bằng phím tắt.
  await page.keyboard.press('1');

  // Tab tới một Ô. Canvas không nhận được focus, nên nếu lớp overlay DOM không
  // tồn tại thì vòng lặp này không bao giờ tìm ra ô nào — đó chính là lý do
  // SlotOverlay tồn tại.
  let reached = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
    if (/^Ô số|^Slot/.test(label)) {
      reached = true;
      break;
    }
  }
  expect(reached, 'Tab không tới được ô nào — lớp overlay DOM bị thiếu').toBe(true);

  // Vòng focus phải THẤY ĐƯỢC, không chỉ tồn tại.
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, style: s.outlineStyle };
  });
  expect(outline?.style).not.toBe('none');
  expect(Number.parseFloat(outline?.width ?? '0')).toBeGreaterThan(0);

  await page.keyboard.press('Enter');
  await expect.poll(() => gold(page)).toBe(200);
});

test('gọi được đợt bằng Space, và Esc bỏ chọn', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await expect(page.getByRole('button', { name: /^Cung 60/ })).toBeVisible();

  await page.keyboard.press('Escape');
  await page.keyboard.press('Space');

  await expect
    .poll(async () => {
      const bar = page.getByRole('progressbar').first();
      return await bar.getAttribute('aria-valuenow');
    })
    .not.toBeNull();

  // Space đã gọi đợt, nên nút gọi đợt phải bị vô hiệu hoá trong lúc đợt chạy.
  await expect(page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ })).toBeDisabled();
});

/* ── NFR-PERF-07 ─────────────────────────────────────────────────────────── */

test('HUD không cập nhật theo frame — trần 10Hz', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  // Phải XÂY rồi mới đo: không có tháp thì trong 5 giây đầu chẳng có gì đổi —
  // enemy cần ~31 giây để đi hết 1072 đơn vị đường — và bộ đếm ra 0 vì HUD
  // đứng im, chứ không phải vì React ngoan.
  for (const slot of ['Ô số 8', 'Ô số 9', 'Ô số 3']) {
    await page.getByRole('button', { name: slot }).click();
    await page.getByTestId('tower-cards').getByRole('button', { name: 'Cung' }).click();
  }
  await page.getByRole('radio', { name: 'x3' }).click();
  await page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ }).click();

  /**
   * Đếm số lần DOM của thanh HUD thay đổi trong 5 giây.
   *
   * Đây là ĐẠI DIỆN cho số lần React render, không phải con số render thật:
   * đếm render thật cần đặt bộ đếm vào code production, và một bộ đếm chỉ để
   * test thì không đáng nằm trong bundle. Đại diện này đủ chặt cho điều cần
   * chặn — nếu React render 60 lần/giây thì số vàng cũng đổi tới 60 lần/giây,
   * và số dưới đây sẽ vọt lên hàng trăm.
   */
  const mutations = await page.evaluate(async () => {
    const hud = document.querySelector('header');
    if (!hud) return -1;
    let count = 0;
    const observer = new MutationObserver((records) => {
      count += records.length;
    });
    observer.observe(hud, { subtree: true, childList: true, characterData: true });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    observer.disconnect();
    return count;
  });

  expect(mutations).toBeGreaterThan(0); // HUD phải sống, không phải đứng im
  // 10Hz × 5s = 50 lần đổi state; mỗi lần có thể đụng vài node text.
  expect(mutations, `HUD đổi ${mutations} lần trong 5 giây`).toBeLessThan(400);
});

/* ── NFR-I18N-04 ─────────────────────────────────────────────────────────── */

for (const locale of ['vi', 'en'] as const) {
  test(`không tràn, không cắt chữ ở locale ${locale} tại 375`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    if (locale === 'en') {
      await page.getByRole('radio', { name: 'EN' }).click();
      await expect(page.getByRole('button', { name: /^PLAY|^CONTINUE/ })).toBeVisible();
    }

    const screens: (() => Promise<void>)[] = [
      async () => {},
      async () => {
        await page.getByRole('button', { name: locale === 'vi' ? /Chọn bản đồ/ : /Choose a map/ }).first().click();
      },
      async () => {
        await page.getByRole('button', { name: locale === 'vi' ? /Quay lại/ : /Back/ }).first().click();
        await page.getByRole('button', { name: locale === 'vi' ? /XƯỞNG|Xưởng/ : /WORKSHOP|Workshop/ }).first().click();
      },
      async () => {
        await page.getByRole('button', { name: locale === 'vi' ? /Quay lại/ : /Back/ }).first().click();
        await page.getByRole('button', { name: locale === 'vi' ? /^CHƠI/ : /^PLAY|^CONTINUE/ }).first().click();
        await page.waitForTimeout(800);
      },
    ];

    for (const [index, go] of screens.entries()) {
      await go();
      await page.waitForTimeout(200);

      const docOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(docOverflow, `màn ${index} cuộn ngang ${docOverflow}px`).toBeLessThanOrEqual(1);

      // Không nhãn nào bị CẮT: chữ rộng hơn khung chứa nó thì `scrollWidth`
      // vượt `clientWidth`, và người chơi thấy chữ mất đuôi.
      const clipped = await page.evaluate(() => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll('button, h1, h2, p, span, dt, dd')) {
          const e = el as HTMLElement;
          // Bỏ qua phần tử ẩn về mặt thị giác: `sr-only` rộng 1px và `overflow:
          // hidden` là ĐÚNG thiết kế, nên `scrollWidth > clientWidth` ở đó không
          // phải chữ bị cắt — người dùng không hề thấy nó.
          if (e.offsetWidth <= 4 || e.offsetHeight <= 4) continue;
          if (e.scrollWidth > e.clientWidth + 1) {
            const style = getComputedStyle(e);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue;
            if (style.textOverflow === 'ellipsis') continue;
            bad.push(`${e.tagName}: "${(e.textContent ?? '').trim().slice(0, 40)}"`);
          }
        }
        return bad;
      });
      expect(clipped, `màn ${index} có nhãn bị cắt`).toEqual([]);
    }
  });
}
