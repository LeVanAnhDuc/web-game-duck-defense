# Ducker ID sign-in — design (Duck Defense)

> **Trả lời:** Phần riêng của Duck Defense trong tính năng đăng nhập Ducker ID: chỗ đặt, hình dạng, chuỗi, file, ngoại lệ NFR.
> **Spec dùng chung (hành vi, cấu hình, test):** `web-game/docs/superpowers/specs/2026-10-04-ducker-id-sign-in-design.md` — không chép lại ở đây.
> **Quyết định:** [ADR-0010](../../decisions/0010-dang-nhap-ducker-id-tuy-chon-sau-co-tinh-nang.md) · FR-37 · US-05

## 1. Chỗ đặt

Thanh trên của `TitleScreen` (`src/views/Title/index.tsx`), ngay sau nút VI/EN, bên
phải. Đặt SAU (không trước) VI/EN để menu tài khoản căn lề phải với mép màn hình và
không tràn ở 375px. Chỉ màn tiêu đề có nút — các màn khác không đổi.

## 2. Hình dạng

- Nút chính là `Press` (cạnh dưới đặc 4px — chữ ký `MASTER.md` §4), biến thể `raised`:
  chữ `--ui-ink` trên `--raised` (§1.1b: chỉ `--ui-ink` trên `--raised`).
- "Đang đăng nhập…" dùng `disabled` của `Press` → `--sunken` + `--ui-dim`, **không opacity**.
- Đã đăng nhập: avatar tròn 32px (`--ui-act` + `--ui-on-act`, chữ cái đầu; hoặc `<img>`
  khi có ảnh) + tên cắt `truncate`, trong một `Press`. Menu: panel `--ui-panel`,
  `--radius-lg`, cạnh đặc; hai mục "Mở hồ sơ Ducker ID" (thẻ `<a>`, cùng chữ ký) và
  "Đăng xuất". Không đỏ/xanh lá làm màu tương tác (§0, bất biến #9).
- Icon vẽ tay cùng bộ `src/components/Icon`: `IconUser`, `IconLogOut`, `IconExternalLink`.
- Vùng bấm ≥ 44px nhờ `min-h-[44px]` của `Press`; chuyển động tắt qua CSS toàn cục
  (`prefers-reduced-motion`).

## 3. Chuỗi (`src/i18n/vi.ts` + `en.ts`, cùng bộ khoá)

| Khoá | vi | en |
| --- | --- | --- |
| `account.signIn` | Đăng nhập | Sign in |
| `account.signingIn` | Đang đăng nhập… | Signing in… |
| `account.menuLabel` | Tài khoản Ducker ID | Ducker ID account |
| `account.openProfile` | Mở hồ sơ Ducker ID | Open Ducker ID profile |
| `account.signOut` | Đăng xuất | Sign out |

## 4. File

`src/auth/{types,config,pkce,flow,requests,session}.ts` · `src/lib/initials.ts` ·
`src/hooks/{useDuckerAuth,useAccountMenu}.ts` · `src/components/AccountButton/index.tsx` ·
`src/main.tsx` nạp `@/auth/session` trước `App` (bất biến #14) · `vite.config.ts` (`base`
từ `VITE_BASE_PATH`) · `.env.example` · `.github/workflows/deploy.yml` (chỉ truyền base).

Lớp hạ tầng nằm ở `src/auth/` (R-01: mỗi vai trò một thư mục) chứ không phải
`src/{libs,requests,constants,types}` của plan chung — R-14 bác `src/types/`, và repo này
dùng `src/lib/` cho hàm thuần.

## 5. Ngoại lệ NFR

Đã ghi ở ADR-0010 và `nfr.md`: NFR-DATA-04 (mạng + `ducker.pkce`), NFR-DATA-01 (PII trong
bộ nhớ), NFR-SEC-04 (vẫn đúng). Không có bài grep/mạng nào trong repo cần thêm allowlist;
bằng chứng là e2e `ducker-sign-in-off.spec.ts` (cờ tắt ⇒ không request ngoài).

## 6. Kiểm thử

- Đơn vị (`tests/auth/`): `readDuckerConfig`, PKCE (vector RFC 7636), `consumeCallback` /
  `startLogin`, session store (một lần đổi code, lỗi → signed-out, đăng xuất),
  `AccountButton` (jsdom + `act`, không thêm dependency), `initialOf`.
- e2e: project `ducker-sign-in` (cổng 5275, cờ bật, issuer giả `http://ducker.test`) +
  `ducker-sign-in-off.spec.ts` ở project mặc định (cổng 5273, cờ ép tắt).
