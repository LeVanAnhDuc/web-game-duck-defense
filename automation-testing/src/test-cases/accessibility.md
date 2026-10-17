# ACCESSIBILITY — Test cases

Requirement: `docs/requirements/accessibility.md` · quyết định: `docs/decisions/accessibility.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Trận Đồng Cỏ (260 vàng), viewport 1440×900 trừ khi ghi khác.

### TC-ACCESSIBILITY-001 — đặt được tháp chỉ bằng bàn phím và vòng focus luôn thấy được

- **Requirement:** REQ-ACCESSIBILITY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** vào trận → `1` → Tab tới một ô → (kiểm focus) → Enter → Tab tới "XÂY · 60" → Enter
- **Mong đợi:** Tab tới được một nút "Ô số N"; `outline-style` ≠ none, `outline-width` > 0; sau Enter Vàng vẫn 260 và nút xây
  hiện; Tab không bao giờ rơi về `<body>`; sau Enter thứ hai Vàng 200
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-002 — vào trận bằng bàn phím thì focus không rơi về body

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** focus "CHƠI" → Enter
- **Mong đợi:** HUD hiện; phần tử đang focus không phải `<body>`
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-003 — nút gọi đợt tự tắt sau khi bấm bằng bàn phím mà focus vẫn ở đó

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** vào trận → focus "GỌI ĐỢT TIẾP THEO" → Enter
- **Mong đợi:** nút `aria-disabled=true`; focus vẫn ở chính nút đó, không ở `<body>`
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-004 — phím 1, 2, 3 chọn đúng Cung, Pháo, Băng

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** vào trận → `2`; → `3`; → `1`
- **Mong đợi:** lần lượt thẻ Pháo, Băng, Cung `aria-pressed=true` (các thẻ khác false); Vàng 260
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-005 — Esc bỏ chọn ô và Space gọi đợt khi không nút nào giữ focus

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** chạm ô 8 → Esc → bấm vào nền trống (bỏ focus khỏi nút) → Space
- **Mong đợi:** sau Esc ô 8 `aria-pressed=false`; sau Space nút gọi đợt `aria-disabled=true`
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-006 — Space trên nút Nâng đang giữ focus nâng tháp và không gọi đợt

- **Requirement:** REQ-ACCESSIBILITY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** xây Cung ô 8 → focus "Nâng 60" → Space
- **Mong đợi:** Vàng giảm đúng 60; "Cung · Bậc 2"; nút gọi đợt vẫn `aria-disabled=false`
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-007 — ở 375px mọi ô, thẻ tháp và nút trận rộng ít nhất 44 x 44

- **Requirement:** REQ-ACCESSIBILITY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** viewport 375×812 → vào trận → chạm ô 8 (mở bảng xây)
- **Mong đợi:** 10 nút ô, 3 thẻ tháp, nút "Quay lại", "Tạm dừng" đều ≥ 44×44px; sau "Huỷ", nút gọi đợt ≥ 44×44px
- **Automated:** `tests/e2e/accessibility/touch-targets.e2e.ts`

### TC-ACCESSIBILITY-008 — vùng aria-live đọc đợt, mạng, vàng và cập nhật sau khi xây

- **Requirement:** REQ-ACCESSIBILITY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** vào trận → xây Cung ô 8
- **Mong đợi:** trước: "Đợt 1/12 · Mạng 20 · Vàng 260"; sau: "Đợt 1/12 · Mạng 20 · Vàng 200"
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-009 — bật giảm chuyển động thì nút không còn hiệu ứng chuyển tiếp

- **Requirement:** REQ-ACCESSIBILITY-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** mở game bình thường, đo `transition-duration` của "CHƠI"; rồi giả lập `prefers-reduced-motion: reduce`, đo lại
- **Mong đợi:** bình thường > 0,01 s; giảm chuyển động ≤ 0,001 s
- **Automated:** `tests/e2e/accessibility/touch-targets.e2e.ts`
