import { test, expect, type Page } from '@playwright/test';

/**
 * Hồi quy cho các lỗi mà code review tìm ra sau khi tính năng đã "xong".
 *
 * Cả bốn đều là lỗi ở TẦNG DÂY NỐI — state đã đúng, hiển thị hoặc input thì
 * không — nên chúng chỉ bắt được trong trình duyệt thật, không bắt được ở
 * `tests/`.
 */

const towerCard = (page: Page, name: string) =>
  page.getByTestId('tower-cards').getByRole('button', { name });

const gold = async (page: Page): Promise<number> => {
  const label = await page.getByRole('group', { name: /^Vàng/ }).first().getAttribute('aria-label');
  return Number((label ?? '').replace(/\D+/g, ''));
};

async function enterBattle(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();
  await expect(page.getByRole('group', { name: /^Vàng/ }).first()).toBeVisible();
}

/**
 * `this.selection` trong scene là một bản CHỤP đã giải sẵn (bậc, giá nâng, giá
 * bán). Bản đầu chỉ giải lại nó sau khi XÂY, không sau khi NÂNG — nên panel giữ
 * bậc cũ và giá cũ, và nút "Nâng" vẫn *bật* vì nó so tiền với giá cũ trong khi
 * `applyIntent` từ chối im lặng vì giá thật đã khác. Bấm mà không có gì xảy ra.
 */
test('nâng cấp làm mới panel: bậc và giá đổi theo, không đứng ở giá cũ', async ({ page }) => {
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();

  await expect(page.getByText('Cung · Bậc 1')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Nâng 60/ })).toBeVisible();

  await page.getByRole('button', { name: /^Nâng 60/ }).click();

  // Bậc VÀ giá đều phải đổi. Giá bậc 2→3 là 110, không phải 60.
  await expect(page.getByText('Cung · Bậc 2')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Nâng 110/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Nâng 60/ })).toHaveCount(0);
});

test('nâng tới bậc cuối thì panel nói "đã tối đa", không mời nâng tiếp', async ({ page }) => {
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();
  await page.getByRole('button', { name: /^Nâng 60/ }).click();
  await page.getByRole('button', { name: /^Nâng 110/ }).click();

  await expect(page.getByText('Cung · Bậc 3')).toBeVisible();
  await expect(page.getByText('Đã tối đa')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Nâng/ })).toHaveCount(0);
});

/**
 * Bản đầu `preventDefault()` mọi phím Space ở tầng window, nên người dùng bàn
 * phím Tab tới một nút rồi bấm Space sẽ GỌI ĐỢT thay vì bấm chính nút đó —
 * `preventDefault` trên keydown chặn luôn cú click ngầm của `<button>`.
 */
test('Space trên một nút đang focus bấm CHÍNH nút đó, không gọi đợt', async ({ page }) => {
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();
  const goldBefore = await gold(page);

  await page.getByRole('button', { name: /^Nâng 60/ }).focus();
  await page.keyboard.press('Space');

  // Nút "Nâng" đã chạy: tiền trừ đúng 60 và bậc lên 2.
  await expect.poll(() => gold(page)).toBe(goldBefore - 60);
  await expect(page.getByText('Cung · Bậc 2')).toBeVisible();

  // Và đợt KHÔNG bị gọi: nút gọi đợt vẫn còn bấm được.
  await expect(page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ })).toBeEnabled();
});

test('Space khi không focus nút nào thì vẫn gọi đợt', async ({ page }) => {
  await enterBattle(page);
  await page.locator('body').click({ position: { x: 5, y: 400 } });
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ })).toBeDisabled();
});

/**
 * Snapshot chỉ mang chi tiết tháp cho ô ĐANG chọn, nên bản đầu đọc mọi ô khác
 * là "Ô số N" — kể cả ô đã xây. Người dùng screen reader không phân biệt được
 * ô nào còn trống.
 */
test('ô đã xây được đọc là "đã xây", không đọc như ô trống', async ({ page }) => {
  await enterBattle(page);

  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await towerCard(page, 'Cung').click();

  // Chọn sang một ô khác để ô 8 không còn là ô đang chọn.
  await page.getByRole('button', { name: 'Ô số 3' }).click();

  await expect(page.getByRole('button', { name: 'Ô số 8 — đã xây' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /^Ô số 3$/ })).toHaveCount(1);
});

/**
 * NFR-REL-03. Bản đầu `return` sớm ra một màn lỗi riêng, và điều đó tháo luôn
 * cái div mà Phaser bám vào — nên "thử lại" huỷ game cũ và không bao giờ khởi
 * động game mới. Màn lỗi ở lại vĩnh viễn.
 */
test('nạp asset thất bại: hiện lỗi, và "thử lại" thật sự khởi động lại được', async ({ page }) => {
  let blocked = true;
  await page.route('**/towerDefense_tilesheet.png', (route) => {
    if (blocked) return route.abort('failed');
    return route.continue();
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('Không tải được dữ liệu game');

  // Mở lại mạng rồi thử lại: lần này phải vào được trận.
  blocked = false;
  await page.getByRole('button', { name: /Thử lại/ }).click();

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('group', { name: /^Vàng/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ô số 8' })).toBeVisible();
});

/** Thanh tiến độ không được nhích trước khi người chơi đánh đợt nào. */
test('thanh tiến độ đợt bắt đầu ở 0, không ở 1', async ({ page }) => {
  await enterBattle(page);
  const bar = page.getByRole('progressbar').first();
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
});
