# RESPONSIVE — Test cases

Requirement: `docs/requirements/responsive.md` · quyết định: `docs/decisions/responsive.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-RESPONSIVE-001 — không màn nào cuộn ngang ở năm mốc bề rộng

- **Requirement:** REQ-RESPONSIVE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** ở mỗi mốc (375×812, 812×375, 768×1024, 1024×768, 1440×900): tiêu đề → chọn bản đồ → xưởng → cài đặt → trận
- **Mong đợi:** mỗi màn tràn ngang ≤ 1px (một test mỗi mốc)
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-002 — canvas vừa khung bàn chơi ngay từ lúc vào trận

- **Requirement:** REQ-RESPONSIVE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** ở 1280×720 vào trận (không resize); lặp lại ở 375×812
- **Mong đợi:** chiều rộng và cao của canvas ≤ khung chứa + 1px
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-003 — ở cả ba bố cục trận HUD, tốc độ và nút gọi đợt nằm trọn trong màn hình

- **Requirement:** REQ-RESPONSIVE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào trận ở 375×812 (dọc), 812×375 (ngang hẹp), 1440×900 (rộng); bấm nút gọi đợt
- **Mong đợi:** chip Vàng, chip Mạng, nhóm tốc độ, nút gọi đợt có hộp bao trọn trong viewport; bấm gọi đợt thì nút
  `aria-disabled=true`
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-004 — xoay máy giữa trận không reset trận

- **Requirement:** REQ-RESPONSIVE-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** 375×812 → vào trận → xây Cung ô 8 → đổi sang 812×375 → đổi lại 375×812
- **Mong đợi:** sau mỗi lần xoay: Vàng 200, ô 8 vẫn có tháp, "Đợt 1"; canvas vẫn vừa khung
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-005 — ở bố cục ngang hẹp vẫn xây được đủ ba bước

- **Requirement:** REQ-RESPONSIVE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** 812×375 → vào trận → ô 8 → Cung → "XÂY · 60"
- **Mong đợi:** nút xác nhận hiện trong màn hình; Vàng 200
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`
