/**
 * Lái game vào khung hình muốn chụp, cho `readme-game/scripts/capture-screenshots.mjs`.
 *
 * Không có file này thì ảnh chụp ra MÀN TIÊU ĐỀ — đúng, nhưng không nói được
 * game chơi thế nào. Nó nằm trong repo game chứ không trong skill vì "cách vào
 * màn chơi" là kiến thức của riêng game này, và commit nó lại nghĩa là lần chụp
 * sau tái lập được đúng khung hình đó.
 *
 * Setup TỰ CHỊU TRÁCH NHIỆM về thời điểm: script chụp chỉ chờ thêm ~120ms sau
 * khi setup xong. Nên hàm này kết thúc ngay tại khung hình cần chụp — một đợt
 * đang chạy, có tháp đã xây, có vòng tầm bắn hiện.
 *
 * `exact: false` + `/^CHƠI/` là cố ý: nút chính đổi chữ giữa "CHƠI" (người mới)
 * và "CHƠI TIẾP" (đã có tiến trình), nên khớp cứng một trong hai sẽ vỡ ở máy có
 * localStorage cũ.
 */
export default async function setup(page) {
  await page.getByRole('button', { name: /^CHƠI/ }).first().click();
  await page.waitForTimeout(900);

  // Xây một tháp: chạm ô rồi chọn loại — hai thao tác, vì một lần chạm ô không
  // bao giờ tự xây (US-01).
  await page.getByRole('button', { name: 'Ô số 8' }).click();
  await page.getByTestId('tower-cards').getByRole('button', { name: 'Cung' }).click();

  await page.getByRole('button', { name: /GỌI ĐỢT TIẾP THEO/ }).click();

  // Chờ địch vào tầm bắn. Game này không thua trong 3 giây nên không có rủi ro
  // chụp phải màn "kết quả" như mấy game hành động.
  await page.waitForTimeout(3000);
}
