# PRIVACY — Quyết định

Đi cặp với `docs/requirements/privacy.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-DATA-01 bảng PII "không có", NFR-DATA-04 "kiểm tab Network sau khi chơi
  một trận đầy đủ (cờ tắt)", NFR-SEC-02), `docs/01-product/overview.md` §4, `README.md` §Features ("Progress goes to
  localStorage under one key").
- **Code:** `client/src/storage/profile.ts` (một khoá, `Profile` type), `client/index.html` (Google Fonts qua `<link>`),
  `client/src/auth/config.ts` (cờ tắt → không request).
- **Test đã gom (gợi ý):** không có e2e cũ cho riêng phần này; `flag-off.e2e.ts` (module `ducker-id`) kiểm request ở màn
  tiêu đề.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Chơi một trận đầy đủ" có cần đánh hết 12 đợt? → không: request (nếu có) đến từ việc nạp trang, vào trận, nạp
  asset, xây, gọi đợt, kết thúc đợt. Một đợt trọn vẹn trên đồng hồ giả + đổi cài đặt phủ mọi đường code gửi được dữ liệu;
  module `result` đã chơi hết trận ở chỗ khác.
- **Q2** Khoá thăm dò `duckdefense.profile.probe` (kiểm ghi được) có vi phạm "một khoá"? → không, nó bị xoá ngay sau khi ghi;
  test kiểm trạng thái sau cùng.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Ngoại lệ có giới hạn của ADR-0010 (đăng nhập bật cờ): module `ducker-id`.
- Log console (NFR-SEC-02 "không log dữ liệu người chơi"): review format log, không phải e2e.

## Tech debt liên quan

_(không có)_
