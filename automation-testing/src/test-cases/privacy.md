# PRIVACY — Test cases

Requirement: `docs/requirements/privacy.md` · quyết định: `docs/decisions/privacy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
"Chơi" = vào trận Đồng Cỏ, xây Cung ô 8, 9, 3, gọi đợt 1 và chạy hết đợt (đồng hồ giả), về màn tiêu đề, đổi âm thanh.

### TC-PRIVACY-001 — chơi một đợt trọn vẹn không gửi gì ra ngoài origin ngoài Google Fonts

- **Requirement:** REQ-PRIVACY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** chơi
- **Mong đợi:** mọi request đều cùng origin, `data:` / `blob:` (không rời máy), hoặc `fonts.googleapis.com` / `fonts.gstatic.com`
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-002 — game không đặt cookie nào

- **Requirement:** REQ-PRIVACY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** chơi
- **Mong đợi:** `context.cookies()` rỗng
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-003 — sau khi chơi chỉ còn một khoá profile chỉ chứa tiến trình

- **Requirement:** REQ-PRIVACY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** chơi
- **Mong đợi:** khoá `localStorage` đúng `[duckdefense.profile]`; `sessionStorage` rỗng; các trường của profile đúng
  `cores, lastMap, locale, maps, schemaVersion, settings, upgrades`
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`
