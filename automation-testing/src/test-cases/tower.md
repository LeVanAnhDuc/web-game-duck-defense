# TOWER — Test cases

Requirement: `docs/requirements/tower.md` · quyết định: `docs/decisions/tower.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Mọi case: trận Đồng Cỏ (260 vàng), viewport 1440×900.

### TC-TOWER-001 — chọn tháp đã xây hiện bậc, sát thương, giá nâng và giá bán

- **Requirement:** REQ-TOWER-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** xây Cung ở ô 8 (tháp vừa xây được chọn)
- **Mong đợi:** "Cung · Bậc 1", "Bậc 1 / 3", sát thương "12 → 18", nút "Nâng 60", "Bán +30"; ô đọc "Cung bậc 1 ở ô số 8"
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-002 — nâng cấp trừ tiền và làm mới panel sang bậc và giá mới

- **Requirement:** REQ-TOWER-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** xây Cung ô 8 → "Nâng 60"
- **Mong đợi:** Vàng 140; "Cung · Bậc 2"; sát thương "18 → 27"; nút "Nâng 110"; không còn nút "Nâng 60"
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-003 — nâng tới bậc cuối thì panel nói Đã tối đa

- **Requirement:** REQ-TOWER-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** xây Cung ô 8 → "Nâng 60" → "Nâng 110"
- **Mong đợi:** "Cung · Bậc 3"; "Đã tối đa"; không còn nút "Nâng"; Vàng 30
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-004 — không đủ vàng thì nút Nâng bị vô hiệu

- **Requirement:** REQ-TOWER-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** xây Pháo ô 8 và ô 9 (còn 40 vàng; tháp ô 9 đang chọn)
- **Mong đợi:** nút "Nâng 120" `disabled`; Vàng vẫn 40 sau khi bấm cưỡng bức
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-005 — bán trả lại nửa giá và ô đó xây lại được

- **Requirement:** REQ-TOWER-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** xây Cung ô 8 → "Bán +30" → xây lại Cung ô 8
- **Mong đợi:** Vàng 200 → 230 → 170; sau khi bán ô 8 đọc lại "Ô số 8"
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-006 — bán tháp đã nâng trả nửa tổng giá xây cộng giá nâng

- **Requirement:** REQ-TOWER-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** xây Cung ô 8 → "Nâng 60" → bán
- **Mong đợi:** nút "Bán +60" (floor((60+60)×0,5)); Vàng 140 → 200
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`

### TC-TOWER-007 — ô đã xây đọc là đã xây, ô trống đọc như ô trống

- **Requirement:** REQ-TOWER-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** xây Cung ô 8 → chạm ô 3
- **Mong đợi:** đúng một nút "Ô số 8 — đã xây"; đúng một nút "Ô số 3"
- **Automated:** `tests/e2e/tower/upgrade-sell.e2e.ts`
