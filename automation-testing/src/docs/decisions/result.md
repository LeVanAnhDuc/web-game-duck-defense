# RESULT — Quyết định

Đi cặp với `docs/requirements/result.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-06, FR-07, FR-13, FR-15, FR-16), `docs/01-product/journeys.md` (US-01
  bước 9 + kết quả mong đợi, "Đóng tab giữa trận → trận đó mất"; US-02 bước 1–4 + "lõi từ chơi lại phải ít hơn hẳn"),
  `docs/03-design/invariants.md` #11, `README.md` §Features ("A loss still pays out…").
- **Code:** `client/src/App.tsx` (`finishBattle`: `coresAward`, `cleared ||= won`, `bestWave = max`, `bestLives` chỉ khi
  thắng), `client/src/core/rewards.ts` (8 lõi/đợt, +120 lần đầu, ×0,35 chơi lại, làm tròn xuống),
  `client/src/views/Result/index.tsx`, `client/src/game/BattleScene.ts` (`checkFinished`: `waveReached`).
- **Test đã gom (gợi ý):** không có — bộ e2e cũ cố ý không chơi hết trận ("`runBattle` headless đã làm việc đó tốt hơn").

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Chơi hết trận trong e2e có đáng không, khi unit test đã chơi headless? → có: phần e2e chứng minh là DÂY NỐI —
  kết quả trận tới React, `finishBattle` ghi đúng profile, màn kết quả nói đúng số. Đồng hồ giả làm một trận thua mất
  ~10 giây, một trận thắng ~40 giây.
- **Q2** Thắng thế nào cho chắc? → tiến trình gieo sẵn có nâng cấp (tiền khởi đầu, sát thương Cung, mạng, giá tháp, tiền
  rơi, thuốc nổ) và một kế hoạch xây theo `referenceLayout` của bản đồ 1, nâng dần khi đủ vàng. Thắng lần đầu vẫn là
  "lần đầu" vì m01 chưa qua. Thưởng không phụ thuộc nâng cấp nên số lõi vẫn là 12 × 8 + 120 = 216.
- **Q3** "Sống sót X / N" khi thua ở đợt 3: X là đợt đang đánh (3) hay số đợt đã xong (2)? → code tính đợt đang đánh
  (`waveIndex + 1`), docs US-02 viết "thua: đợt 9/14" khi "mất hết mạng ở đợt 9" → cùng nghĩa: X = 3. Lõi 3 × 8 = 24.
- **Q4** Tải lại giữa trận: `lastMap` được ghi ngay lúc vào trận (để nút CHƠI biết đi đâu). Có vi phạm invariants #11
  ("không ghi giữa trận") không? → không: #11 cấm ghi STATE trận nửa vời; `lastMap` không phải state trận. REQ-RESULT-07
  chỉ đòi không có lõi/kỷ lục nào từ trận dở.

## Tài khoản test

Không có. Tiến trình gieo vào `localStorage`.

## Ngoài phạm vi

- Cân bằng (mọi bản đồ thắng được không cần nâng cấp, FR-32): unit test `client/tests/balance/*`.
- Thắng bản đồ cuối (không có "Bản đồ tiếp theo"): đòi chơi hết bản đồ 5 — quá đắt cho e2e; nhánh này là một điều kiện
  `index < length - 1` trong `Result`, không có dây nối riêng.

## Tech debt liên quan

_(không có)_
