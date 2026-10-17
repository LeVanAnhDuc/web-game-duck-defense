# TITLE — Test cases

Requirement: `docs/requirements/title.md` · quyết định: `docs/decisions/title.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-TITLE-001 — lần đầu mở thấy một nút CHƠI, hai lối phụ, cài đặt và chân trang trống

- **Requirement:** REQ-TITLE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** không có gì trong `localStorage`
- **Bước:** mở game
- **Mong đợi:** h1 "Duck Defense", tagline "Giữ đường. Đừng để chúng đi qua."; nút "CHƠI", "Chọn bản đồ",
  "Xưởng nâng cấp", "Cài đặt"; "Đã mở 1 / 5 bản đồ"; lõi `0`; không có dòng "· kỷ lục đợt"
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-002 — người mới bấm CHƠI vào thẳng trận Đồng Cỏ ở đợt 1

- **Requirement:** REQ-TITLE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** mở game → "CHƠI"
- **Mong đợi:** màn trận (canvas + HUD), không qua màn chọn bản đồ; "Đợt 1 / 12", Vàng 260, Mạng 20
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-003 — có tiến trình thì nút vẫn là CHƠI và dòng phụ gọi con số là kỷ lục

- **Requirement:** REQ-TITLE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** m01, m02 đã qua; m03 kỷ lục đợt 6; bản đồ chơi gần nhất m03
- **Bước:** mở game
- **Mong đợi:** nút "CHƠI" (không có nút "CHƠI TIẾP"); dòng "Đầm Sương · kỷ lục đợt 6 / 14"
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-004 — CHƠI khi có tiến trình vào bản đồ chơi gần nhất

- **Requirement:** REQ-TITLE-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Tiền điều kiện:** m01 đã qua; bản đồ chơi gần nhất m02
- **Bước:** mở game → "CHƠI"
- **Mong đợi:** trận Hẻm Đá: "Đợt 1 / 14", Vàng 240, Mạng 18
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-005 — chưa có bản đồ chơi gần nhất thì CHƠI vào bản đồ mở cuối cùng

- **Requirement:** REQ-TITLE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Tiền điều kiện:** m01 đã qua, `lastMap` = null
- **Bước:** mở game → "CHƠI"
- **Mong đợi:** trận Hẻm Đá ("Đợt 1 / 14", Vàng 240)
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-006 — chân trang đếm số bản đồ đã mở và số lõi đang giữ

- **Requirement:** REQ-TITLE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** m01, m02 đã qua; 340 lõi
- **Bước:** mở game
- **Mong đợi:** "Đã mở 3 / 5 bản đồ"; lõi `340`
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`

### TC-TITLE-007 — tới chọn bản đồ, xưởng, cài đặt và Quay lại về màn tiêu đề

- **Requirement:** REQ-TITLE-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** "Chọn bản đồ" → "Quay lại"; "Xưởng nâng cấp" → "Quay lại"; "Cài đặt" → "Quay lại"
- **Mong đợi:** mỗi lần thấy đúng h1 của màn ("Chọn bản đồ", "Xưởng nâng cấp", "Cài đặt"), rồi lại thấy nút "CHƠI"
- **Automated:** `tests/e2e/title/title-screen.e2e.ts`
