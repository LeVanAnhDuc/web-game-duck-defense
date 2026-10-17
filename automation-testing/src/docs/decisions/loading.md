# LOADING — Quyết định

Đi cặp với `docs/requirements/loading.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-REL-03 "nạp asset thất bại phải hiện lỗi và cho thử lại"),
  `docs/specs/tower-defense-v1/design.md` §5 (bảng lỗi).
- **Code:** `client/src/views/Battle/index.tsx` (`loadError`, `attempt`: lớp phủ thay vì màn riêng, để khung Phaser không
  bị tháo), `client/src/game/BattleScene.ts` (`load.on('loaderror')` → `onLoadError(file.src)`), `client/src/game/sprites.ts`
  (`SHEET_URL` = `assets/kenney/towerDefense_tilesheet.png`).
- **Test đã gom (gợi ý):** `client/e2e/review-regressions.spec.ts` "nạp asset thất bại: hiện lỗi, và thử lại thật sự khởi
  động lại được" (→ TC-LOADING-001/002).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Giả lập "mạng hỏng" thế nào? → `page.route` huỷ đúng request sprite sheet (`route.abort('failed')`), rồi cho đi qua
  khi thử lại — đúng cách case cũ làm; không tắt cả mạng vì trang đã nạp xong JS.
- **Q2** "Quay lại" từ lớp lỗi đi đâu? Docs không nói; code gọi `onQuit` → màn chọn bản đồ, giống nút quay lại của trận →
  chấp nhận (REQ-LOADING-03, P2).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Nạp JS/CSS của chính trang thất bại (trang trắng) — không có đường code nào để kiểm; ngoài tầm của app.

## Tech debt liên quan

_(không có)_
