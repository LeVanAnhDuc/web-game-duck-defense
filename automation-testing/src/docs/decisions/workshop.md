# WORKSHOP — Quyết định

Đi cặp với `docs/requirements/workshop.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-11, FR-12, FR-27), `docs/01-product/journeys.md` (US-02 bước 4–6,
  "bấm mua hai lần rất nhanh → chỉ được trừ tiền một lần", "node phải hiện lý do bị khoá"), `docs/02-requirements/nfr.md`
  (NFR-REL-02), `docs/specs/tower-defense-v1/design.md` §5 (bấm hai lần: "lần bấm thứ hai đọc giá mới"),
  `docs/design-system/tower-defense/MASTER.md` §6 (≥1024 bốn cột), `docs/03-design/invariants.md` #8.
- **Code:** `client/src/views/Workshop/index.tsx` (`canBuy`, `buyUpgrade` đọc bậc từ state, `NodeRow`, `invested`),
  `client/src/data/upgradeTree.ts` (giá, bậc tối đa, điều kiện, `TOTAL_TREE_COST` = 5545), `client/src/core/upgrades.ts`.
- **Test đã gom (gợi ý):** không có.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** NFR-REL-02 / US-02: "mua hai lần liên tiếp chỉ trừ tiền một lần" — nhưng design đã duyệt (§5) nói lần bấm thứ hai
  đọc giá MỚI và mua bậc kế. Hai văn bản mâu thuẫn? → không: đọc cùng nhau, điều bị cấm là trừ hai lần cho MỘT bậc (trả
  tiền mà không được gì). Hai cú bấm khi đủ tiền cho hai bậc là hai lần mua hợp lệ (TC-WORKSHOP-009); khi chỉ đủ một bậc
  thì đúng một lần trừ (TC-WORKSHOP-008). → REQ-WORKSHOP-06.
- **Q2** "Áp cho mọi trận sau" kiểm thế nào? → hai hiệu ứng thấy được ở UI trận mà không cần chơi: vàng khởi đầu (+50) và
  thẻ tháp mới (Sét 260). Hiệu ứng sát thương / bán kính / làm chậm là số trong mô phỏng, đã có unit test `upgrades.test.ts`.
- **Q3** Bố cục tab dưới 1024px có phải requirement? → có: MASTER §6 chốt, và màn này phải dùng được ở 375 (FR-30).

## Tài khoản test

Không có. Lõi và bậc nâng cấp gieo vào `localStorage`.

## Ngoài phạm vi

- Lõi kiếm được sau trận: module `result`. Tràn ngang ở các mốc bề rộng: module `responsive`.

## Tech debt liên quan

_(không có)_
