# PERFORMANCE — Quyết định

Đi cặp với `docs/requirements/performance.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-PERF-05…10), `docs/03-design/invariants.md` #7, `README.md` ("a browser
  test counts HUD updates to keep it honest").
- **Code:** `client/src/bridge/index.ts` (`SNAPSHOT_INTERVAL_MS` = 100), `client/src/game/BattleScene.ts` (snapshot qua
  `time.addEvent`, không trong `update`), `.github/workflows/ci.yml` (bước "Cổng kích thước bundle (NFR-PERF-08)").
- **Test đã gom (gợi ý):** `client/e2e/a11y-i18n-perf.spec.ts` "HUD không cập nhật theo frame — trần 10Hz"
  (→ TC-PERFORMANCE-001, giữ nguyên phép đếm).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** NFR-PERF-07 nói "đếm số lần render trong 5 giây, phải ≤ 50"; đếm render thật cần bộ đếm trong code production.
  Đo gì? → giữ đại diện của case cũ: số bản ghi `MutationObserver` trên `<header>` trong 5 giây thời gian thật, trần 400
  (10Hz × 5 s = 50 lần đổi state, mỗi lần đụng vài node chữ). Render theo frame (60Hz) sẽ cho hàng trăm-nghìn bản ghi.
  Phép đo chạy thời gian THẬT, không đồng hồ giả: điều cần chứng minh là nhịp theo đồng hồ tường.
- **Q2** NFR-PERF-08 (bundle) kiểm ở đâu? → CI đã có cổng chặn sau `pnpm build` (`ci.yml`). Một spec Playwright không đo
  được gzip của bản build (vite preview không nén) — TC ghi `manual` trỏ về cổng CI.
- **Q3** NFR-PERF-05 (60 fps), -09 (3 giây trên 4G), -10 (trận headless < 200 ms): đo bằng dev overlay, Lighthouse và unit
  test — ngoài phạm vi e2e chức năng.

## Tài khoản test

Không có.

## Ngoài phạm vi

- NFR-PERF-05, -06 (đã có TC-WAVE-007 cho phần thấy được), -09, -10 — xem Q3.

## Tech debt liên quan

_(không có)_
