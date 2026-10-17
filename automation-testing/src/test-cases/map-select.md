# MAPSELECT — Test cases

Requirement: `docs/requirements/map-select.md` · quyết định: `docs/decisions/map-select.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-MAPSELECT-001 — người mới thấy bản đồ 1 mở và bốn bản đồ sau khoá kèm lý do

- **Requirement:** REQ-MAPSELECT-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn tiêu đề → "Chọn bản đồ"
- **Mong đợi:** năm thẻ "1. Đồng Cỏ" … "5. Lò Rèn Cũ"; thẻ 1 "Chưa qua" + "Chưa chơi lần nào"; thẻ 2–5 "Chưa mở" +
  "Cần qua <bản đồ trước> để mở" (Đồng Cỏ, Hẻm Đá, Đầm Sương, Đèo Gió)
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`

### TC-MAPSELECT-002 — thẻ nói đã qua, kỷ lục, mở hay khoá theo tiến trình

- **Requirement:** REQ-MAPSELECT-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** m01 đã qua còn 17 mạng; m02 kỷ lục đợt 5, chưa qua
- **Bước:** "Chọn bản đồ"
- **Mong đợi:** thẻ 1 "Đã qua" + "12 / 12 đợt · còn 17 mạng"; thẻ 2 "Chưa qua" + "Kỷ lục: đợt 5 / 14" và bấm được;
  thẻ 3 "Chưa mở" + "Cần qua Hẻm Đá để mở"
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`

### TC-MAPSELECT-003 — bấm thẻ đang mở vào trận đúng bản đồ đó

- **Requirement:** REQ-MAPSELECT-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** m01 đã qua
- **Bước:** "Chọn bản đồ" → thẻ Hẻm Đá
- **Mong đợi:** trận "Đợt 1 / 14", Vàng 240, Mạng 18
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`

### TC-MAPSELECT-004 — thẻ bản đồ còn khoá không bấm được và không vào trận

- **Requirement:** REQ-MAPSELECT-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** "Chọn bản đồ" → bấm cưỡng bức thẻ Hẻm Đá (khoá)
- **Mong đợi:** thẻ `disabled`; vẫn ở màn chọn bản đồ, không có HUD trận
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`

### TC-MAPSELECT-005 — ở 375px mọi thẻ hiện trọn tên, trạng thái và lý do khoá

- **Requirement:** REQ-MAPSELECT-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** viewport 375×720; m01, m02 đã qua, m03 kỷ lục đợt 6 (thẻ đủ ba loại trạng thái)
- **Bước:** "Chọn bản đồ"
- **Mong đợi:** không span chữ nào của năm thẻ có kích thước 0 hay tràn ra ngoài khung thẻ; "Cần qua Đầm Sương để mở"
  thấy được
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`

### TC-MAPSELECT-006 — màn chọn bản đồ hiện số lõi và dẫn sang xưởng

- **Requirement:** REQ-MAPSELECT-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Tiền điều kiện:** 115 lõi
- **Bước:** "Chọn bản đồ" → "Xưởng nâng cấp"
- **Mong đợi:** chip "Lõi: 115"; sau khi bấm thấy h1 "Xưởng nâng cấp"
- **Automated:** `tests/e2e/map-select/map-cards.e2e.ts`
