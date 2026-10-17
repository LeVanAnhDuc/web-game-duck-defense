# BUILD — Quyết định

Đi cặp với `docs/requirements/build.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-08, FR-23, FR-33), `docs/01-product/journeys.md` (US-01 bước 3–5,
  "chạm vào ô mà không đủ tiền", "chạm nhầm … không bao giờ vô tình xây"), `docs/decisions/0009-xay-thap-ba-buoc-de-xem-truoc-tam-ban.md`,
  `docs/specs/ux-fixes-persona-2026-09/design.md`, `README.md` §Controls ("two steps, so a stray tap never spends gold").
- **Code:** `client/src/views/Battle/index.tsx` (`pickSlot`, `pickTower`, `confirmBuild`, `canBuild`, `confirmRow`),
  `client/src/views/Battle/components/TowerCard/index.tsx`, `TowerDetail/index.tsx` (giây = round(cooldown/60, 1)),
  `client/src/data/towers.ts`, `client/src/core/battle.ts` (`applyIntent` build).
- **Test đã gom (gợi ý):** `client/e2e/us01-play.spec.ts` → `tests/e2e/build/three-step.e2e.ts`: "xây tháp trừ đúng tiền…"
  (→ TC-BUILD-001/003), "không đủ tiền thì thẻ tháp bị vô hiệu hoá" (→ TC-BUILD-004); case gọi đợt sang module `wave`,
  case bán tháp sang module `tower`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** README §Controls còn ghi "two steps" (chạm ô, chạm thẻ), còn FR-33/ADR-0009 là BA bước (thêm nút xác nhận).
  Theo cái nào? → FR-33/ADR-0009: mới hơn, có thiết kế đã duyệt, và chính README §Features mô tả "before you pay". Dòng
  §Controls là chữ cũ — ghi ở "Tech debt liên quan", không coi là bug của app.
- **Q2** US-01 bước 4 nói "kèm giá và một dòng mô tả"; FR-33 thêm số liệu. Số nào? → ba số `TowerDetail` hiện: sát thương,
  tầm bắn, nhịp bắn (giây, 1 chữ số thập phân theo locale). Kiểm với Cung bậc 1: 12, 78, "0,8 s".
- **Q3** "Dấu hiệu không phải màu" của thẻ không đủ tiền kiểm thế nào? → icon giá của thẻ không đủ tiền khác icon của thẻ
  đủ tiền (khoá ≠ xu), cộng `disabled`. Không so màu.
- **Q4** Phím `1 2 3` khi đã chọn ô: docs cũ (US-01 bản đầu) cho là xây luôn; sau FR-33 nó chỉ chọn loại. → chỉ chọn loại
  (REQ-BUILD-06); không có đường nào từ một phím tới mất tiền.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Vòng tầm bắn vẽ trong canvas (FR-23): không đọc được qua DOM; số liệu tầm bắn trong bảng xây là phần kiểm được.
- Đặt tháp chỉ bằng bàn phím (Tab tới ô): module `accessibility`.
- Bố cục bảng xây ở 375 / ngang hẹp: module `responsive`.

## Tech debt liên quan

- `README.md` §Controls dòng "Build a tower … two steps" chưa cập nhật theo FR-33 (ba bước). Tài liệu, không phải hành vi.
