# RESULT — Test cases

Requirement: `docs/requirements/result.md` · quyết định: `docs/decisions/result.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Trận Đồng Cỏ (12 đợt, 20 mạng). "Thua nhanh" = không xây, gọi đợt liên tiếp: hết mạng ở đợt 3 (5 + 8 + 9 Lính/Chạy
nhanh). Mọi case chạy trên đồng hồ giả.

### TC-RESULT-001 — hết mạng thì thua và màn kết quả báo đợt, mạng, số địch đã diệt

- **Requirement:** REQ-RESULT-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** thua nhanh
- **Mong đợi:** h1 "Thua"; "Đồng Cỏ"; "Sống sót 3 / 12 đợt"; "Còn 0 mạng"; "Diệt 0 địch"
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-002 — thua vẫn nhận lõi theo số đợt và lõi được cộng vào tiến trình

- **Requirement:** REQ-RESULT-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** thua nhanh → "Xưởng nâng cấp"
- **Mong đợi:** "+24" lõi; xưởng hiện "Lõi: 24"; profile đã lưu `cores` 24, m01 `bestWave` 3, `cleared` false
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-003 — thắng lần đầu Đồng Cỏ được 216 lõi kèm dòng thưởng lần đầu

- **Requirement:** REQ-RESULT-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** m01 chưa qua; nâng cấp sẵn: tiền khởi đầu 4, Cung sắc bén 4, mạng 3, giá tháp 3, tiền rơi 3, thuốc nổ 3
- **Bước:** xây theo kế hoạch (Cung ô 8, Pháo ô 9, Băng ô 10, Cung ô 4, Pháo ô 1, Cung ô 6), x3, gọi đợt liên tiếp và nâng
  dần khi đủ vàng tới hết đợt 12
- **Mong đợi:** h1 "Thắng"; "Sống sót 12 / 12 đợt"; "+216"; "Thắng lần đầu — thưởng thêm 120 lõi"
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-004 — sau lần thắng đầu bản đồ được lưu là đã qua và Bản đồ tiếp theo vào Hẻm Đá

- **Requirement:** REQ-RESULT-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** (tiếp TC-RESULT-003) đọc profile → "Bản đồ tiếp theo"
- **Mong đợi:** profile m01 `cleared` true, `bestWave` 12, `bestLives` = số mạng màn kết quả báo; trận mới "Đợt 1 / 14",
  Vàng 240 + 200 (nâng cấp tiền khởi đầu)
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-005 — chơi lại bản đồ đã qua thì lõi giảm, màn kết quả nói rõ và trạng thái đã qua còn nguyên

- **Requirement:** REQ-RESULT-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** m01 đã qua còn 17 mạng
- **Bước:** vào Đồng Cỏ → thua nhanh → "Chọn bản đồ"
- **Mong đợi:** "+8" (floor(24 × 0,35)); "Chơi lại nên lõi giảm"; không có dòng thưởng lần đầu; thẻ Đồng Cỏ vẫn "Đã qua" +
  "12 / 12 đợt · còn 17 mạng"
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-006 — Chơi lại vào một trận mới của cùng bản đồ từ đợt 1

- **Requirement:** REQ-RESULT-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thua nhanh → "Chơi lại"
- **Mong đợi:** "Đợt 1 / 12", Mạng 20, Vàng 260, tiến độ 0
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-007 — Chọn bản đồ từ màn kết quả thấy kỷ lục đợt vừa đạt

- **Requirement:** REQ-RESULT-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thua nhanh → "Chọn bản đồ"
- **Mong đợi:** h1 "Chọn bản đồ"; thẻ Đồng Cỏ "Kỷ lục: đợt 3 / 12"
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`

### TC-RESULT-008 — tải lại giữa trận về màn tiêu đề và không lưu gì của trận dở

- **Requirement:** REQ-RESULT-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** vào trận → xây Cung ô 8 → gọi đợt → chạy hết đợt 1 → tải lại trang
- **Mong đợi:** màn tiêu đề (nút "CHƠI"); lõi `0`; profile m01 `bestWave` 0, `cleared` false; vào lại trận thì Vàng 260
- **Automated:** `tests/e2e/result/battle-end.e2e.ts`
