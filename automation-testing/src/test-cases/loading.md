# LOADING — Test cases

Requirement: `docs/requirements/loading.md` · quyết định: `docs/decisions/loading.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Tiền điều kiện chung: request `**/towerDefense_tilesheet.png` bị huỷ (`route.abort('failed')`); viewport 1440×900.

### TC-LOADING-001 — sprite sheet không tải được thì hiện lỗi kèm tên file, Thử lại và Quay lại

- **Requirement:** REQ-LOADING-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** màn tiêu đề → "CHƠI"
- **Mong đợi:** `alert` chứa "Không tải được dữ liệu game." và "towerDefense_tilesheet.png"; nút "Thử lại", "Quay lại"
- **Automated:** `tests/e2e/loading/asset-failure.e2e.ts`

### TC-LOADING-002 — Thử lại khi mạng đã ổn thì vào được trận thật sự

- **Requirement:** REQ-LOADING-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** như TC-LOADING-001 → cho request đi qua → "Thử lại"
- **Mong đợi:** không còn `alert`; chip Vàng hiện; "Ô số 8" hiện
- **Automated:** `tests/e2e/loading/asset-failure.e2e.ts`

### TC-LOADING-003 — Quay lại từ lớp lỗi về màn chọn bản đồ

- **Requirement:** REQ-LOADING-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** như TC-LOADING-001 → "Quay lại" trong lớp lỗi
- **Mong đợi:** h1 "Chọn bản đồ"
- **Automated:** `tests/e2e/loading/asset-failure.e2e.ts`
