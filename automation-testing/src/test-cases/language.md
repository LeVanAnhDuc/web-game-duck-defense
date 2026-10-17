# LANGUAGE — Test cases

Requirement: `docs/requirements/language.md` · quyết định: `docs/decisions/language.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-LANGUAGE-001 — đổi sang English ở màn tiêu đề đổi chữ ngay mà không tải lại trang

- **Requirement:** REQ-LANGUAGE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở game → công tắc "EN"
- **Mong đợi:** nút "PLAY", "Choose a map", "Workshop", tagline "Hold the road. Let nothing through."; dấu đặt trên `window`
  trước khi đổi vẫn còn (không tải lại)
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-002 — đổi ngôn ngữ trong cài đặt cũng đổi chữ ngay

- **Requirement:** REQ-LANGUAGE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** "Cài đặt" → "English" → "Back"
- **Mong đợi:** h1 "Settings", nhãn "Sound"; về màn tiêu đề thấy "PLAY"
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-003 — ngôn ngữ đã chọn còn nguyên sau tải lại

- **Requirement:** REQ-LANGUAGE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** "EN" → tải lại
- **Mong đợi:** "PLAY"; "EN" được chọn; profile đã lưu `locale` "en"
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-004 — tiếng Anh phủ màn chọn bản đồ, xưởng và trận

- **Requirement:** REQ-LANGUAGE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** "EN" → "Choose a map" → "Back" → "Workshop" → "Back" → "PLAY" → chạm ô 8
- **Mong đợi:** thẻ "Meadow" "Not cleared" "Not played yet", "Clear Meadow to open"; node "Starting gold"; trận "Wave 1 / 12",
  chip "Gold: 260", nút "CALL NEXT WAVE", thẻ "Archer"; không còn "Đồng Cỏ", "Vàng", "GỌI ĐỢT"
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-005 — ở 375px tiếng Việt không tràn ngang và không cắt chữ

- **Requirement:** REQ-LANGUAGE-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** 375×812, tiếng Việt: màn tiêu đề → chọn bản đồ → xưởng → trận
- **Mong đợi:** mỗi màn: tràn ngang ≤ 1px; không nhãn nào bị cắt
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-006 — ở 375px tiếng Anh không tràn ngang và không cắt chữ

- **Requirement:** REQ-LANGUAGE-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** như TC-LANGUAGE-005 sau khi đổi sang "EN"
- **Mong đợi:** như TC-LANGUAGE-005
- **Automated:** `tests/e2e/language/language.e2e.ts`

### TC-LANGUAGE-007 — nhịp bắn hiện dấu thập phân theo ngôn ngữ

- **Requirement:** REQ-LANGUAGE-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** trận → ô 8 (xem Cung); rồi trận mới ở tiếng Anh → ô 8
- **Mong đợi:** "0,8 s" ở tiếng Việt; "0.8s" ở tiếng Anh
- **Automated:** `tests/e2e/language/language.e2e.ts`
