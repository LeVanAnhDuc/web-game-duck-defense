# WORKSHOP — Test cases

Requirement: `docs/requirements/workshop.md` · quyết định: `docs/decisions/workshop.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Giá: Tiền khởi đầu 60 / 110 / 180 / 270; Tiền rơi 80 / 140 / 220; Lãi cuối đợt cần Tiền rơi bậc 2; Bán lại 190 (1 bậc,
cần Giá tháp bậc 1); Tháp Sét 300 (cần Cung sắc bén bậc 3). Viewport 1440×900 trừ khi ghi khác.

### TC-WORKSHOP-001 — ở màn rộng xưởng hiện bốn nhánh cạnh nhau, số lõi và tổng đã đầu tư

- **Requirement:** REQ-WORKSHOP-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** 300 lõi, chưa mua gì
- **Bước:** màn tiêu đề → "Xưởng nâng cấp"
- **Mong đợi:** bốn tiêu đề nhánh Kinh tế, Sát thương, Tiện ích, Mở khoá; chip "Lõi: 300"; "Đã đầu tư 0 / 5545 lõi"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-002 — dưới 1024px các nhánh thành tab, mặc định Kinh tế

- **Requirement:** REQ-WORKSHOP-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** viewport 375×812
- **Bước:** mở xưởng → tab "Tiện ích"
- **Mong đợi:** ban đầu tab Kinh tế được chọn và thấy "Tiền khởi đầu"; sau khi đổi thấy "Mạng khởi đầu", không còn thấy
  "Tiền khởi đầu"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-003 — mua một bậc trừ đúng giá, lên bậc và đổi sang giá bậc kế

- **Requirement:** REQ-WORKSHOP-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** 200 lõi
- **Bước:** "Tiền khởi đầu" → "Nâng 60"
- **Mong đợi:** "Lõi: 140"; "Bậc 1 / 4"; nút "Nâng 110"; "Đã đầu tư 60 / 5545 lõi"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-004 — thiếu một lõi thì nút mua bị vô hiệu

- **Requirement:** REQ-WORKSHOP-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** 59 lõi
- **Bước:** mở xưởng
- **Mong đợi:** nút "Nâng 60" của "Tiền khởi đầu" `disabled`; bấm cưỡng bức không đổi gì ("Lõi: 59", "Bậc 0 / 4")
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-005 — vừa đủ lõi thì mua được và lõi về 0

- **Requirement:** REQ-WORKSHOP-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** 60 lõi
- **Bước:** "Tiền khởi đầu" → "Nâng 60"
- **Mong đợi:** "Lõi: 0"; "Bậc 1 / 4"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-006 — node chưa đạt điều kiện hiện Khoá kèm lý do, đạt thì mở

- **Requirement:** REQ-WORKSHOP-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** 400 lõi, Tiền rơi bậc 1
- **Bước:** mở xưởng → (kiểm "Lãi cuối đợt") → "Tiền rơi" → "Nâng 140"
- **Mong đợi:** trước: "Lãi cuối đợt" hiện "Khoá" và "Cần Tiền rơi bậc 2", không có nút mua; sau: "Lãi cuối đợt" có nút
  "Nâng 220", không còn "Khoá"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-007 — mua tới bậc tối đa thì node nói Đã tối đa và hết nút mua

- **Requirement:** REQ-WORKSHOP-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** 190 lõi, Giá tháp bậc 1
- **Bước:** "Bán lại" → "Nâng 190"
- **Mong đợi:** "Bán lại" hiện "Đã tối đa"; không còn nút mua trong node; "Lõi: 0"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-008 — bấm mua hai lần thật nhanh khi chỉ đủ một bậc thì chỉ trừ một lần

- **Requirement:** REQ-WORKSHOP-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Tiền điều kiện:** 100 lõi
- **Bước:** double-click "Nâng 60" của "Tiền khởi đầu"
- **Mong đợi:** "Lõi: 40"; "Bậc 1 / 4"; profile đã lưu `cores` 40, `upgrades.startGold` 1
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-009 — bấm hai lần thật nhanh khi đủ hai bậc thì mua hai bậc theo hai giá

- **Requirement:** REQ-WORKSHOP-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Tiền điều kiện:** 170 lõi
- **Bước:** double-click "Nâng 60" của "Tiền khởi đầu"
- **Mong đợi:** "Lõi: 0" (60 + 110); "Bậc 2 / 4"
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-010 — nâng cấp đã mua còn sau tải lại và cộng vàng khởi đầu cho trận sau

- **Requirement:** REQ-WORKSHOP-07
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** 60 lõi
- **Bước:** mua "Tiền khởi đầu" → tải lại → mở xưởng → "Quay lại" → "CHƠI"
- **Mong đợi:** sau tải lại: "Bậc 1 / 4", "Lõi: 0"; trong trận: Vàng 310 (260 + 50)
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`

### TC-WORKSHOP-011 — mở khoá Tháp Sét thì trận sau có thẻ tháp Sét

- **Requirement:** REQ-WORKSHOP-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** 300 lõi, Cung sắc bén bậc 3
- **Bước:** "Tháp Sét" (nhánh Mở khoá) → "Nâng 300" → "Quay lại" → "CHƠI" → chạm ô 8
- **Mong đợi:** "Tháp Sét" hiện "Đã tối đa"; trong trận bảng xây có thẻ "Sét" giá 260 cạnh ba tháp khởi đầu
- **Automated:** `tests/e2e/workshop/upgrade-tree.e2e.ts`
