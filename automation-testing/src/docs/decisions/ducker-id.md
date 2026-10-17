# DUCKERID — Quyết định

Đi cặp với `docs/requirements/ducker-id.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-37), `docs/01-product/journeys.md` (US-05 + "Điều gì có thể sai"),
  `docs/decisions/0010-dang-nhap-ducker-id-tuy-chon-sau-co-tinh-nang.md`, `docs/specs/ducker-id-sign-in/design.md`,
  `docs/02-requirements/nfr.md` (NFR-DATA-04 ngoại lệ `ducker.pkce`), `docs/03-design/invariants.md` #14,
  `client/.env.example` (năm biến, thiếu một biến là tắt).
- **Code:** `client/src/auth/*` (`config.ts`, `flow.ts`, `session.ts`, `pkce.ts`), `client/src/hooks/useDuckerAuth.ts`,
  `client/src/hooks/useAccountMenu.ts`, `client/src/components/AccountButton/index.tsx`.
- **Test đã gom (gợi ý):** `client/e2e/ducker-sign-in-off.spec.ts` → `tests/e2e/ducker-id/flag-off.e2e.ts` (→ TC-DUCKERID-001/002);
  `client/e2e/ducker-sign-in.spec.ts` → `tests/e2e/ducker-id/sign-in.e2e.ts` (→ TC-DUCKERID-003…011; issuer giả chuyển vào
  `src/fixtures/issuer.fixture.ts`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bản bật cờ lấy ở đâu? → `playwright.config.ts` build `../client` lần thứ hai vào `dist-auth/` với cờ bật và issuer
  giả `http://ducker.test`, phục vụ ở `:5275`; project `app-auth` chỉ chạy `sign-in.e2e.ts`, chỉ có trên dev (bản Pages tắt cờ).
- **Q2** US-05 bước 3 nói menu có "tên, email"; case cũ chỉ kiểm tên. Email có phải requirement? → không đưa vào REQ: giữ
  đúng phạm vi case cũ đã được duyệt cùng feature (tên + hồ sơ + đăng xuất). Email là dòng phụ code chỉ hiện khi có cả tên
  lẫn email — ghi ở Ngoài phạm vi để không biến một chi tiết trình bày thành luật.
- **Q3** Case "tab thứ hai khi tab đầu đang đăng nhập" (US-05) kiểm thế nào? → chính là TC-DUCKERID-006: mở `?code=&state=` khi
  không có phiên chờ — `ducker.pkce` nằm trong sessionStorage của tab đầu, tab hai không có.

## Tài khoản test

Không có tài khoản thật: issuer giả trả `sub: u1`, tên "Lê Văn Anh Đức", email `duc@ducker.id`.

## Ngoài phạm vi

- Dòng email trong menu (xem Q2). Ảnh đại diện từ URL ngoài (issuer giả không trả `picture`).
- Đăng nhập thật với một Ducker ID đang chạy — cần server Ducker ID; thuộc bộ test của Ducker ID.

## Tech debt liên quan

_(không có)_
