# RESPONSIVE — Quyết định

Đi cặp với `docs/requirements/responsive.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-30 "bố cục thật ở 375 · 768 · 1024 · 1440, cả hai chiều xoay"),
  `docs/01-product/journeys.md` (US-01 "Xoay điện thoại giữa trận → bố cục đổi, trận không được phép reset"),
  `docs/03-design/invariants.md` #12 (canvas 720×720 trong khung 580 ở 1280×720), `docs/design-system/tower-defense/MASTER.md` §6.
- **Code:** `client/src/hooks/useLayoutMode.ts` (rộng: ≥768 và cao ≥600; ngang hẹp: landscape và cao ≤599; còn lại dọc),
  `client/src/views/Battle/index.tsx` (`GRID`, `confirmRow` có ở cả ba bố cục), `client/src/game/boot.ts` (`refresh`:
  `getParentBounds()` rồi `refresh()`, `ResizeObserver`).
- **Test đã gom (gợi ý):** `client/e2e/look.spec.ts` → `tests/e2e/responsive/layout.e2e.ts` ("chụp mọi màn ở <mốc>" — chỉ
  khẳng định không cuộn ngang; thành TC-RESPONSIVE-001, bỏ phần chụp ảnh, `waitForTimeout` thay bằng chờ tiêu đề màn);
  `client/e2e/review-regressions.spec.ts` "canvas vừa khung bàn ngay từ lúc boot" (→ TC-RESPONSIVE-002).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Case cũ chụp ảnh từng màn "để người thật xem". Giữ phần chụp? → không: ảnh không phải bằng chứng tự động, và mỗi
  lần chạy ghi 25 ảnh vào `test-results/`. Khi cần nhìn, `trace: retain-on-failure` đã có ảnh của lần đỏ.
- **Q2** Invariants #12 tả lỗi ở 1280×720. Đo ở đâu? → đúng 1280×720 (mốc của lỗi gốc) và 375×812; sai số 1px làm tròn.
- **Q3** "Bấm được" ở REQ-RESPONSIVE-03 kiểm thế nào? → hộp bao nằm trọn trong viewport; riêng nút gọi đợt còn bấm thật
  (đợt bắt đầu) — đó là cái lỗi canvas phủ lên nút từng làm hỏng.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Kích thước vùng bấm 44px: module `accessibility`. Chữ bị cắt theo ngôn ngữ: module `language`. Thẻ bản đồ 375px: module
  `map-select`.
- Thiết bị thật xoay màn hình (sự kiện `orientationchange`): giả lập bằng đổi viewport, cùng media query.

## Tech debt liên quan

_(không có)_
