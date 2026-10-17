# SETTINGS — Test cases

Requirement: `docs/requirements/settings.md` · quyết định: `docs/decisions/settings.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-SETTINGS-001 — cài đặt có nhóm ngôn ngữ và đúng một thanh âm thanh, không có nhạc nền

- **Requirement:** REQ-SETTINGS-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** màn tiêu đề → "Cài đặt"
- **Mong đợi:** h1 "Cài đặt"; nhóm "Ngôn ngữ" có "Tiếng Việt" và "English"; một thanh trượt "Âm thanh"; không có điều
  khiển "Nhạc nền"; trên trang chỉ có một `slider`
- **Automated:** `tests/e2e/settings/sound.e2e.ts`

### TC-SETTINGS-002 — âm thanh mặc định 80% và kéo về 0 thì hiện Tắt

- **Requirement:** REQ-SETTINGS-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mở cài đặt → đặt thanh về 0
- **Mong đợi:** trước: giá trị 80, nhãn "80%"; sau: giá trị 0, nhãn "Tắt"
- **Automated:** `tests/e2e/settings/sound.e2e.ts`

### TC-SETTINGS-003 — âm lượng đã chọn còn nguyên sau tải lại

- **Requirement:** REQ-SETTINGS-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** cài đặt → đặt 35 → tải lại → cài đặt
- **Mong đợi:** giá trị 35, nhãn "35%"; profile đã lưu `settings.sfx` 0,35
- **Automated:** `tests/e2e/settings/sound.e2e.ts`

### TC-SETTINGS-004 — thanh âm thanh tìm được bằng nhãn và chỉnh được bằng phím mũi tên

- **Requirement:** REQ-SETTINGS-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** focus thanh tìm theo nhãn "Âm thanh" → ←
- **Mong đợi:** thanh nhận focus; giá trị 75, nhãn "75%"
- **Automated:** `tests/e2e/settings/sound.e2e.ts`

### TC-SETTINGS-005 — âm lượng mặc định thì xây tháp phát tiếng

- **Requirement:** REQ-SETTINGS-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** đếm `OscillatorNode.start` bằng init script
- **Bước:** vào trận → xây Cung ô 8
- **Mong đợi:** ít nhất một nguồn âm được bật
- **Automated:** `tests/e2e/settings/sound.e2e.ts`

### TC-SETTINGS-006 — âm lượng Tắt thì trận không phát một tiếng nào

- **Requirement:** REQ-SETTINGS-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** như TC-SETTINGS-005
- **Bước:** cài đặt → đặt 0 → "Quay lại" → vào trận → xây Cung ô 8 → Nâng
- **Mong đợi:** 0 nguồn âm được bật
- **Automated:** `tests/e2e/settings/sound.e2e.ts`
