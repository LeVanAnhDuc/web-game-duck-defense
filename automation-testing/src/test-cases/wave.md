# WAVE — Test cases

Requirement: `docs/requirements/wave.md` · quyết định: `docs/decisions/wave.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Mọi case: trận Đồng Cỏ (260 vàng, 20 mạng, đợt 1 = 5 Lính, đợt 2 = 8 Lính), viewport 1440×900. Case chạy hết đợt dùng
đồng hồ giả.

### TC-WAVE-001 — trước đợt đầu thanh tiến độ ở 0 và dải Đợt tới báo 5 Lính

- **Requirement:** REQ-WAVE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** vào trận
- **Mong đợi:** "Đợt 1 / 12"; progressbar `aria-valuenow=0`; "5× Lính"; nút gọi đợt `aria-disabled=false`
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-002 — đang có đợt thì nút gọi đợt tắt mà vẫn ở trong tab order

- **Requirement:** REQ-WAVE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** gọi đợt → bấm nút gọi đợt thêm lần nữa
- **Mong đợi:** `aria-disabled=true`, không có thuộc tính `disabled`, focus được; nhãn vẫn "Đợt 1 / 12" (không gọi chồng)
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-003 — hết đợt 1 thì tiến độ lên 1, sang Đợt 2 và nút gọi đợt bật lại

- **Requirement:** REQ-WAVE-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** gọi đợt (không xây) → chạy tới khi đợt hết
- **Mong đợi:** progressbar `aria-valuenow=1`; "Đợt 2 / 12"; "8× Lính"; nút gọi đợt `aria-disabled=false`
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-004 — tháp diệt Lính thì mỗi con ra đúng 11 vàng

- **Requirement:** REQ-WAVE-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** xây Cung ở ô 8, 9, 3 (còn 80 vàng) → x3 → gọi đợt → chạy hết đợt
- **Mong đợi:** Vàng 80 + 5 × 11 = 135; Mạng 20
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-005 — Lính đi hết đường thì mỗi con trừ một mạng

- **Requirement:** REQ-WAVE-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** gọi đợt 1 (không xây) → chạy hết đợt
- **Mong đợi:** Mạng 20 → 15; Vàng vẫn 260
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-006 — tốc độ mặc định x1 và đổi được sang x2, x3

- **Requirement:** REQ-WAVE-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào trận → x2 → x3
- **Mong đợi:** ban đầu chỉ x1 `aria-checked=true`; sau mỗi lần bấm đúng ô vừa chọn được đánh dấu
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-007 — cùng một đợt ở x1 và x3 mất đúng số mạng như nhau

- **Requirement:** REQ-WAVE-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** hai trận mới, không xây: một trận gọi đợt 1 ở x1, một trận ở x3, chạy hết đợt
- **Mong đợi:** cả hai Mạng 15
- **Automated:** `tests/e2e/wave/waves.e2e.ts`

### TC-WAVE-008 — tạm dừng làm trận đứng yên và Tiếp tục chạy lại

- **Requirement:** REQ-WAVE-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** gọi đợt → chạy 4 giây → "Tạm dừng" → cho 60 giây trôi → "Tiếp tục" → chạy hết đợt
- **Mong đợi:** khi dừng: nút "Tiếp tục" `aria-pressed=true`; sau 60 giây vẫn Mạng 20 và tiến độ 0 (đợt thường hết trong
  ~35 giây); sau khi tiếp tục và hết đợt: Mạng 15
- **Automated:** `tests/e2e/wave/waves.e2e.ts`
