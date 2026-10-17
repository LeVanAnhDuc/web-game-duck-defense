# WAVE — Quyết định

Đi cặp với `docs/requirements/wave.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-02, FR-03, FR-05, FR-06, FR-10, FR-22, FR-24, FR-36),
  `docs/02-requirements/nfr.md` (NFR-PERF-06), `docs/03-design/invariants.md` (#4 tốc độ = nhiều tick hơn, #5 ý định ở
  ranh giới tick, #7 snapshot 10Hz), `docs/01-product/journeys.md` (US-01 bước 6–8), `README.md` §Features + §Controls.
- **Code:** `client/src/views/Battle/components/CallWaveButton`, `WaveBar`, `WaveNumber`, `NextWaveStrip`, `SpeedControl`,
  `PauseButton`; `client/src/game/BattleScene.ts` (`update`: `acc`, `speed`, `MAX_STEPS_PER_FRAME`, `paused`);
  `client/src/core/battle.ts` (`startWave` chỉ ở `prep`); `client/src/data/maps/m01-dong-co.ts`, `client/src/data/enemies.ts`.
- **Test đã gom (gợi ý):** `client/e2e/us01-play.spec.ts` "gọi đợt: enemy ra, bị bắn, chết ra tiền, rồi sang đợt 2"
  (→ TC-WAVE-003/004), `client/e2e/review-regressions.spec.ts` "thanh tiến độ đợt bắt đầu ở 0" (→ TC-WAVE-001).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Một đợt cần ~35 giây thời gian game; chờ thật thì suite chậm và giòn. → đồng hồ giả (`page.clock`, cài trước khi
  tải trang) và đi từng frame 200 ms (`BattlePage.advance`). Mô phỏng fixed-timestep nên kết quả giống chạy thật —
  đã đối chiếu: không tháp, đợt 1–3 Đồng Cỏ mất 5 / 8 / hết mạng như khi chạy thời gian thật.
- **Q2** NFR-PERF-06 "tụt frame không đổi kết quả" kiểm ở e2e thế nào? → phần thấy được ở UI: cùng một đợt không tháp ở x1
  và x3 mất đúng 5 mạng (TC-WAVE-007). Phép so state cuối với dt khác nhau đã có ở unit test (`client/tests/balance/determinism.test.ts`).
- **Q3** Case cũ khẳng định "ba tháp Cung diệt sạch đợt 1, không mất mạng" — đó là cân bằng, không phải chức năng. Giữ
  không? → giữ, vì nó là đường tắt chắc chắn để chứng minh "diệt địch ra tiền" chính xác tới từng đồng (5 × 11 vàng);
  nếu cân bằng đổi làm nó đỏ thì đó đúng là tin cần biết (US-01: thắng bản đồ 1 không cần đọc hướng dẫn).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Hình ảnh địch / đạn / thanh máu trong canvas — không đọc được qua DOM.
- Phím Space gọi đợt và focus sau khi nút tự tắt: module `accessibility`. HUD ≤ 10Hz: module `performance`.
- Thắng / thua và màn kết quả: module `result`.

## Tech debt liên quan

_(không có)_
