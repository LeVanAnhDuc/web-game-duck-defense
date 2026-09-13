# ADR-0006 · npm + Vite + Vitest + Tailwind, deploy tĩnh lên GitHub Pages

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** ADR-0001 · ADR-0002 · NFR-PERF-08 · NFR-PERF-09 · NFR-SEC-05 · NFR-A11Y-01

## 1. Bối cảnh

Dự án mới, chưa có `package.json`. Workspace `web-app-ecosystem` có hai thế hệ dùng
hai bộ công cụ khác nhau: thế hệ một dùng Yarn classic, thế hệ hai dùng npm. Đây là
dự án mới nhất và nằm trong `web-game/`, không thuộc thế hệ nào đã có.

## 2. Quyết định

**npm** làm quản lý gói. **Vite 7** làm build và dev server. **Vitest** cho test lõi
(dùng chung transform và cấu hình với Vite). **Tailwind CSS 4** cho vỏ React, với
token của `MASTER.md` khai báo dưới dạng CSS variable ở `:root` rồi map vào theme của
Tailwind — không hardcode hex trong class. **Playwright** cho kiểm trên trình duyệt
thật ở 4 mốc bề rộng. Deploy là **GitHub Pages**, build tĩnh, `base` đặt theo tên repo.

> **Superseded 13.09.2026** — the workspace moved to pnpm 10; see the `build(deps)` commit that converted this repo.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Yarn classic (như thế hệ một của workspace) | `CLAUDE.md` của workspace ghi rõ thế hệ hai chạy npm, và chạy `yarn install` ở đó sinh cây phụ thuộc khác làm test đổ. Dự án mới thì đi theo bộ đang được dùng, không theo bộ cũ |
| Jest cho test | Cần cấu hình transform riêng cho TS và ESM, tách khỏi cấu hình Vite. Vitest dùng lại đúng cấu hình đã có |
| CSS Modules hoặc CSS thuần thay Tailwind | Chấp nhận được, nhưng Tailwind làm skill `ui-styling` của dự án áp dụng được, và token dạng CSS variable ăn thẳng vào theme của nó. Đây là lựa chọn tiện, không phải lựa chọn bắt buộc |
| shadcn/ui | Nó là thư viện component cho app, dựng trên Radix. Game này không có form, dialog phức tạp, combobox hay data table — thứ shadcn giỏi. Kéo cả Radix vào để dùng hai cái nút là ăn ngân sách bundle (NFR-PERF-08) mà không được gì |
| Cypress thay Playwright | Playwright kiểm được nhiều bề rộng và cả chiều xoay trong một lần chạy, và chạy được nhiều engine. NFR-A11Y và NFR-PERF-05 cần đúng thứ đó |
| Vercel / Netlify | Vẫn miễn phí ở mức này, nhưng thêm một dịch vụ và một tài khoản cho một trang tĩnh không có backend. GitHub Pages là chỗ ít bộ phận nhất |

## 4. Hệ quả

**Được:**
- Một cấu hình dùng cho cả dev, build và test.
- Deploy chỉ là đẩy thư mục build; đúng trần $0 của `overview.md` §5.
- Token trong `MASTER.md` có một đường dẫn duy nhất vào code: CSS variable → theme
  Tailwind. Không có bản sao thứ hai của bảng màu.

**Mất / phải chấp nhận:**
- Lệch với ba dự án thế hệ một trong workspace (chúng dùng Yarn). Ai nhảy qua lại
  giữa hai bên phải nhớ.
- GitHub Pages phục vụ dưới đường dẫn con, nên `base` của Vite phải đặt đúng, và
  đường dẫn asset phải là tương đối — sai chỗ này thì local chạy mà production trắng
  màn hình, một lỗi rất dễ mắc.
- Tailwind 4 còn mới; cấu hình theme của nó đã đổi so với 3.

**Điều kiện xem lại quyết định này:** cần server-side rendering hoặc route thật
(không cần, đây là một SPA một màn) · hoặc bundle vượt trần NFR-PERF-08 và phải cắt
Tailwind ra.
