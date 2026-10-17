# DUCKERID — Test cases

Requirement: `docs/requirements/ducker-id.md` · quyết định: `docs/decisions/ducker-id.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
TC-001/002 chạy trên bản cờ tắt (project `app`); còn lại trên bản bật cờ với issuer giả (project `app-auth`, chỉ dev).

### TC-DUCKERID-001 — cờ tắt thì không có nút đăng nhập và không request nào ra ngoài

- **Requirement:** REQ-DUCKERID-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** mở game (bản cờ tắt)
- **Mong đợi:** không có nút "Đăng nhập" / "Tài khoản Ducker ID"; mọi request đều cùng origin (trừ `data:` và Google Fonts);
  sessionStorage không có `ducker.pkce`
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-002 — cờ tắt thì code và state lạ trên URL được để yên

- **Requirement:** REQ-DUCKERID-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** mở `./?code=abc&state=xyz` (bản cờ tắt)
- **Mong đợi:** màn tiêu đề hiện; query vẫn là `?code=abc&state=xyz`
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-003 — đăng nhập xong thấy nút tài khoản, URL sạch và không lỗi console

- **Requirement:** REQ-DUCKERID-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở game → "Đăng nhập"
- **Mong đợi:** nút "Tài khoản Ducker ID"; query không chứa `code=` / `state=`; không có lỗi console
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-004 — menu tài khoản hiện tên, hồ sơ, đăng xuất và trả focus đúng chỗ

- **Requirement:** REQ-DUCKERID-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → mở menu → Esc → mở menu → "Đăng xuất"
- **Mong đợi:** "Lê Văn Anh Đức"; "Mở hồ sơ Ducker ID" `href` = `http://ducker.test/profile`; sau Esc focus ở nút tài khoản;
  sau đăng xuất focus ở "Đăng nhập"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-005 — tải lại khi đang đăng nhập thì về chưa đăng nhập

- **Requirement:** REQ-DUCKERID-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → tải lại
- **Mong đợi:** nút "Đăng nhập"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-006 — state bị sửa thì về chưa đăng nhập và URL sạch

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** mở `./?code=stolen&state=evil` (không có phiên chờ)
- **Mong đợi:** nút "Đăng nhập"; query rỗng
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-007 — Ducker ID trả lỗi thì về chưa đăng nhập và URL sạch

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** mở `./?error=access_denied&error_description=nope`
- **Mong đợi:** nút "Đăng nhập"; query rỗng
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-008 — đã đăng nhập thì game vẫn chơi được

- **Requirement:** REQ-DUCKERID-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → "CHƠI"
- **Mong đợi:** canvas trận và HUD hiện
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-009 — nhãn đăng nhập và menu bằng tiếng Anh

- **Requirement:** REQ-DUCKERID-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** "EN" → "Sign in" → mở menu
- **Mong đợi:** "Sign in", "Ducker ID account", "Open Ducker ID profile", "Sign out"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-010 — ở 375px nút đăng nhập rộng ít nhất 44 và không đè công tắc ngôn ngữ

- **Requirement:** REQ-DUCKERID-09
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** 375×700 → mở game
- **Mong đợi:** nút "Đăng nhập" ≥ 44×44; mép trái ≥ mép phải công tắc ngôn ngữ; mép phải ≤ 375
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-011 — ở 320 và 375px thanh trên không xuống dòng và menu nằm trong màn hình

- **Requirement:** REQ-DUCKERID-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** ở 320 / 375 × vi / en: mở game → đăng nhập → mở menu
- **Mong đợi:** nút đăng nhập cùng hàng với công tắc (lệch < 8px); sau đăng nhập thanh trên giữ chiều cao, công tắc ≥ 44×44,
  nút tài khoản không đè công tắc và nằm trong màn hình; menu `position: absolute`, nằm trọn trong bề rộng, không đẩy thanh
  trên (một test mỗi tổ hợp)
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`
