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

  // FR-33 — chọn ô KHÔNG trả tiền. Trước đây Enter ở đây là xây luôn, nên người
  // chơi không bao giờ thấy tầm bắn trước khi mua.
  await expect(page.getByRole('button', { name: /^XÂY · |^BUILD · / })).toBeVisible();
  expect(await gold(page)).toBe(260);

  // Đi tiếp tới nút xây, vẫn chỉ bằng bàn phím, và focus không được rơi đi đâu.
  let onBuild = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => document.activeElement !== document.body),
      'focus rơi về <body> giữa chừng — NFR-A11Y-02',
    ).toBe(true);
    const text = await page.evaluate(() => document.activeElement?.textContent ?? '');
    if (/^XÂY · |^BUILD · /.test(text)) {
      onBuild = true;
      break;
    }
  }
  expect(onBuild, 'Tab không tới được nút xây').toBe(true);

  await page.keyboard.press('Enter');
  await expect.poll(() => gold(page)).toBe(200);
});

/* ── NFR-A11Y-02 · FR-36 ─────────────────────────────────────────────────── */

test('focus không bao giờ rơi về <body>, kể cả khi nút gọi đợt tự tắt', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  // Vào trận bằng bàn phím: màn tiêu đề bị thay, nên nút vừa bấm biến mất.
  const play = page.getByRole('button', { name: /^CHƠI|^PLAY/ }).first();
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('group', { name: /^Vàng|^Gold/ }).first()).toBeVisible();
  expect(
    await page.evaluate(() => document.activeElement !== document.body),
    'vào trận xong focus rơi về <body>',
  ).toBe(true);

  // Nút gọi đợt tự tắt ngay khi bấm. Với `disabled` thật nó rời tab order và
  // trình duyệt thả focus — đó là lần mất dấu thứ hai mà persona bàn phím đo được.
  const callWave = page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO|CALL NEXT WAVE/ }).first();
  await callWave.focus();
  await page.keyboard.press('Enter');
  await expect(callWave).toHaveAttribute('aria-disabled', 'true');
  expect(
    await page.evaluate(() => document.activeElement !== document.body),
    'nút gọi đợt tắt xong focus rơi về <body>',
  ).toBe(true);
});

test('Esc bỏ chọn, và Space gọi đợt khi không có nút nào đang focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  // `aria-pressed` của chính nút Ô là dấu hiệu ĐỘC LẬP BỐ CỤC cho việc đã chọn.
  // Gợi ý "Chạm ô trống để xây" chỉ có ở bản dọc, còn thẻ tháp "Cung 60" thì ở
  // bản rộng luôn hiện — cả hai đều không chứng minh được là đã chọn hay chưa.
  const slot = page.getByRole('button', { name: 'Ô số 8' });
  await slot.click();
  await expect(slot).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Escape');
  await expect(slot).toHaveAttribute('aria-pressed', 'false');

  // Phải RỜI focus khỏi nút Ô trước khi bấm Space.
  //
  // Cú bấm ở trên đặt focus vào chính nút Ô đó, và Space trên một nút đang
  // focus giờ kích hoạt CHÍNH nút đó chứ không gọi đợt — xem
  // `e2e/review-regressions.spec.ts`. Bản đầu của test này bấm Space ngay và
  // "thành công" chỉ vì lúc đó phím tắt đang chiếm phím của mọi nút, tức là nó
  // khẳng định đúng cái lỗi mà NFR-A11Y-02 tồn tại để tránh.
  await page.locator('body').click({ position: { x: 5, y: 400 } });
  await page.keyboard.press('Space');

  // `aria-disabled`, không phải `disabled` — FR-36. Nút phải Ở LẠI trong tab
  // order sau khi tắt, nếu không người dùng bàn phím mất dấu focus ngay đó.
  await expect(page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

/* ── NFR-PERF-07 ─────────────────────────────────────────────────────────── */

test('HUD không cập nhật theo frame — trần 10Hz', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterBattle(page);

  // Phải XÂY rồi mới đo: không có tháp thì trong 5 giây đầu chẳng có gì đổi —
  // enemy cần ~31 giây để đi hết 1072 đơn vị đường — và bộ đếm ra 0 vì HUD
  // đứng im, chứ không phải vì React ngoan.
  // Ba bước, không phải hai — FR-33. Chạm thẻ tháp chỉ CHỌN, nút xây mới trả tiền.
  for (const slot of ['Ô số 8', 'Ô số 9', 'Ô số 3']) {
    await page.getByRole('button', { name: slot }).click();
    await page.getByTestId('tower-cards').getByRole('button', { name: 'Cung' }).click();
    await page.getByRole('button', { name: /^XÂY · / }).click();
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
