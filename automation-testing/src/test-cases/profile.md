# PROFILE — Test cases

Requirement: `docs/requirements/profile.md` · quyết định: `docs/decisions/profile.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-PROFILE-001 — đổi một cài đặt ghi ngay một khoá profile có schemaVersion 1

- **Requirement:** REQ-PROFILE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** người mới → "Cài đặt" → âm thanh 50
- **Mong đợi:** `localStorage` có đúng một khoá `duckdefense.profile`; giá trị `schemaVersion` 1, `settings.sfx` 0,5, `cores` 0
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-002 — profile JSON vỡ được giữ nguyên văn, game bắt đầu mới và nói rõ

- **Requirement:** REQ-PROFILE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Tiền điều kiện:** `duckdefense.profile` = `{"schemaVersion":1,"cores":` (JSON cắt cụt)
- **Bước:** mở game
- **Mong đợi:** màn tiêu đề bình thường, "Đã mở 1 / 5 bản đồ", lõi `0`; thông báo "Dữ liệu lưu cũ không đọc được…"; có khoá
  `duckdefense.profile.corrupt.<số>` chứa đúng chuỗi cũ
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-003 — profile sai schemaVersion được giữ lại và game bắt đầu mới

- **Requirement:** REQ-PROFILE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** profile hợp lệ nhưng `schemaVersion` 2 và 999 lõi
- **Bước:** mở game
- **Mong đợi:** lõi `0`; thông báo "Dữ liệu lưu cũ không đọc được…"; khoá `.corrupt.<số>` chứa bản cũ (999 lõi)
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-004 — một trường sai được sửa về mặc định, phần còn lại giữ nguyên

- **Requirement:** REQ-PROFILE-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Tiền điều kiện:** m01 đã qua, `cores` = "abc"
- **Bước:** mở game
- **Mong đợi:** thông báo hiện; "Đã mở 2 / 5 bản đồ" (m01 vẫn đã qua); lõi `0`; không có khoá `.corrupt.`
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-005 — nâng cấp và bản đồ của phiên bản khác bị bỏ, phần còn lại giữ nguyên

- **Requirement:** REQ-PROFILE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Tiền điều kiện:** `upgrades` = { startGold: 1, laserTower: 2 }; `maps` có thêm `m09`; 50 lõi
- **Bước:** mở game → "Xưởng nâng cấp"
- **Mong đợi:** thông báo hiện; "Tiền khởi đầu" "Bậc 1 / 4"; "Lõi: 50"
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-006 — trình duyệt chặn lưu trữ thì game vẫn chơi được và nói rõ

- **Requirement:** REQ-PROFILE-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Tiền điều kiện:** truy cập `localStorage` ném `SecurityError`
- **Bước:** mở game → "CHƠI" → xây Cung ô 8
- **Mong đợi:** thông báo "Trình duyệt không cho lưu dữ liệu, nên tiến trình sẽ KHÔNG được giữ lại…"; vào được trận; Vàng 200
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-007 — chuỗi HTML và script trong profile không bao giờ chạy hay hiện ra

- **Requirement:** REQ-PROFILE-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Tiền điều kiện:** `locale` = `<img src=x onerror="window.__pwned=1">`, `lastMap` = `<script>window.__pwned=1</script>`
- **Bước:** mở game → "Chọn bản đồ"
- **Mong đợi:** `window.__pwned` không tồn tại; không có `<img>` nào trỏ `x`; không có hộp thoại; chữ ở tiếng Việt ("CHƠI");
  không có dòng kỷ lục (lastMap lạ bị bỏ)
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`

### TC-PROFILE-008 — đóng thông báo thì nó biến mất và bản cũ vẫn được giữ

- **Requirement:** REQ-PROFILE-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Tiền điều kiện:** JSON vỡ như TC-PROFILE-002
- **Bước:** mở game → "Đóng" trên thông báo
- **Mong đợi:** thông báo biến mất; khoá `.corrupt.<số>` vẫn còn
- **Automated:** `tests/e2e/profile/saved-profile.e2e.ts`
