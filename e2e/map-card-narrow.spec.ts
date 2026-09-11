import { test, expect } from '@playwright/test';

/* ── FR-35 · bất biến #13 ─────────────────────────────────────────────────── */

/**
 * Thẻ bản đồ ở bề rộng hẹp phải ĐỌC ĐƯỢC, không chỉ tồn tại trong DOM.
 *
 * Lỗi mà test này khoá lại là loại "sai âm thầm" tệ nhất: chữ vẫn nằm trong DOM,
 * `visibility` vẫn là `visible`, cây accessibility vẫn đọc ra đủ tên bản đồ — nên
 * mọi assertion kiểu `toBeVisible()` hay `toHaveText()` đều XANH. Chỉ có điều
 * không một pixel chữ nào được vẽ ra, vì thẻ là grid item bỏ sàn `min-height`,
 * bị lưới nén xuống vừa khít container, và `overflow-hidden` cắt trọn khối chữ.
 *
 * Vì vậy phép kiểm ở đây là HÌNH HỌC, không phải ngữ nghĩa: khối chữ có nằm lọt
 * trong khung thẻ không.
 */
test('thẻ bản đồ ở 375px hiện đủ tên, trạng thái và lý do khoá', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem(
      'duckdefense.profile',
      JSON.stringify({
        schemaVersion: 1,
        locale: 'vi',
        cores: 115,
        upgrades: {},
        maps: {
          m01: { cleared: true, bestWave: 12, bestLives: 20 },
          m02: { cleared: true, bestWave: 13, bestLives: 11 },
          m03: { cleared: false, bestWave: 6, bestLives: 0 },
          m04: { cleared: false, bestWave: 0, bestLives: 0 },
          m05: { cleared: false, bestWave: 0, bestLives: 0 },
        },
        settings: { music: 0.5, sfx: 0.8 },
        lastMap: 'm03',
      }),
    );
  });
  await page.goto('/');
  await page.getByRole('button', { name: /^Chọn bản đồ|^Choose a map/ }).first().click();

  const clipped = await page.evaluate(() => {
    const names = ['Đồng Cỏ', 'Hẻm Đá', 'Đầm Sương', 'Đèo Gió', 'Lò Rèn Cũ'];
    const bad: string[] = [];
    for (const name of names) {
      const card = [...document.querySelectorAll('button')].find((b) => b.innerText.includes(name));
      if (!card) {
        bad.push(`${name}: không tìm thấy thẻ`);
        continue;
      }
      const cardBox = card.getBoundingClientRect();
      // Phần tử con nào chứa chữ thì phải nằm TRỌN trong khung thẻ.
      const textNodes = [...card.querySelectorAll('span')].filter(
        (s) => s.children.length === 0 && (s.textContent ?? '').trim().length > 0,
      );
      if (textNodes.length === 0) {
        bad.push(`${name}: thẻ không có phần tử chữ nào`);
        continue;
      }
      for (const node of textNodes) {
        const b = node.getBoundingClientRect();
        if (b.height === 0 || b.width === 0) {
          bad.push(`${name}: "${node.textContent}" có kích thước 0`);
        } else if (b.bottom > cardBox.bottom + 1 || b.top < cardBox.top - 1) {
          bad.push(
            `${name}: "${node.textContent}" bị cắt (chữ ${Math.round(b.top)}–${Math.round(b.bottom)}, thẻ ${Math.round(cardBox.top)}–${Math.round(cardBox.bottom)})`,
          );
        }
      }
    }
    return bad;
  });

  expect(clipped, clipped.join(' · ')).toEqual([]);

  // Và lý do khoá — thứ mà `done_when` của RR-03 đòi — phải thật sự đọc được.
  await expect(page.getByText('Cần qua Đầm Sương để mở')).toBeVisible();
});
