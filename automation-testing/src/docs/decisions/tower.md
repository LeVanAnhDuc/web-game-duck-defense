# TOWER — Quyết định

Đi cặp với `docs/requirements/tower.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-05, FR-09), `docs/01-product/journeys.md` (US-01 bước 7),
  `docs/02-requirements/nfr.md` (NFR-A11Y-07), `docs/specs/tower-defense-v1/design.md` (kinh tế: bán = tổng đã tiêu ×
  tỉ lệ, làm tròn xuống), `README.md` §Features ("three upgrade levels each").
- **Code:** `client/src/views/Battle/components/SelectedTowerPanel/index.tsx`, `SlotOverlay/index.tsx` (nhãn ô),
  `client/src/core/economy.ts` (`sellValue`, `upgradeCostOf`), `client/src/data/towers.ts`.
- **Test đã gom (gợi ý):** `client/e2e/review-regressions.spec.ts` → `tests/e2e/tower/upgrade-sell.e2e.ts`: "nâng cấp làm
  mới panel" (→ TC-TOWER-002), "nâng tới bậc cuối" (→ TC-TOWER-003), "ô đã xây được đọc là đã xây" (→ TC-TOWER-007);
  `client/e2e/us01-play.spec.ts` "bán tháp trả lại tiền" (→ TC-TOWER-005). Các case khác của review-regressions sang
  `accessibility` (Space), `loading` (nạp asset), `wave` (thanh tiến độ), `responsive` (canvas vừa khung).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Giá bán: docs nói "giá bán" (FR-05) mà không nói tỉ lệ; design + code: floor(tổng đã tiêu × 0,5), 0,75 với node
  "Bán lại". → chấp nhận; tháp đã nâng thì "tổng đã tiêu" gồm cả giá nâng (TC-TOWER-006, lăng kính 2).
- **Q2** Panel hiện sát thương "12 → 18" — "→ bậc kế" có phải requirement? → có: README "three upgrade levels" + FR-33 tinh
  thần "thấy số liệu trước khi trả tiền" áp cho nâng cấp; code hiện đúng như vậy.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Nâng cấp toàn cục ở xưởng (khác với nâng một tháp trong trận): module `workshop`.
- Hiệu lực thật của tháp (bắn, làm chậm, xuyên giáp) — luật mô phỏng, phủ bởi unit test `client/tests/core/*`.

## Tech debt liên quan

_(không có)_
