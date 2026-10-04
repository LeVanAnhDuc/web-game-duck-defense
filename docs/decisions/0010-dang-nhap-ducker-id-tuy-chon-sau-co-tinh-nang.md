# ADR-0010 · Đăng nhập Ducker ID tuỳ chọn, ship tối sau một cờ tính năng

> **Ngày:** 2026-10-04
> **Trạng thái:** accepted
> **Liên quan:** FR-37 · US-05 · NFR-DATA-04 · NFR-DATA-01 · NFR-SEC-04 · supersedes ADR-0007 (phần `base`) · thu hẹp Non-Goal "không có tài khoản" ở `overview.md` §4

<!-- Spec dùng chung 11 game: web-game/docs/superpowers/specs/2026-10-04-ducker-id-sign-in-design.md -->

## 1. Bối cảnh

Người dùng yêu cầu (2026-10-04) cho cả 11 game trong `web-game/` một nút **"Đăng nhập
bằng Ducker ID"** tuỳ chọn, cùng cơ chế với `web-app-calculate-badminton`: OIDC
Authorization Code + PKCE, public client. Phạm vi **chỉ là danh tính** — nút đăng
nhập, avatar + tên, menu tài khoản. Tiến trình, điểm, cài đặt không đổi.

Hai ràng buộc người dùng đặt ra: giá trị cấu hình phải đến từ **biến môi trường thật,
không bao giờ có giá trị dự phòng viết cứng trong code**; và tính năng chưa phát hành —
code vào `main` nhưng bản GitHub Pages không được hiện nó.

## 2. Quyết định

- Thêm `src/auth/` (config → PKCE → bắt callback → request token/userinfo → session
  store ngoài React) và `AccountButton` ở thanh trên của màn tiêu đề, cạnh VI/EN.
- **Cờ `VITE_FEATURE_DUCKER_SIGN_IN` chỉ bật khi đúng chuỗi `true`**, và chỉ khi cả
  `VITE_DUCKER_ISSUER`, `_CLIENT_ID`, `_SCOPE`, `_PROFILE_PATH` đều có. `readDuckerConfig`
  là hàm thuần quyết định, không `??`/`||` với giá trị mặc định. Tắt ⇒ không một node
  DOM, không đụng `location.search`, không storage, không request.
- **Ship tối:** `deploy.yml` KHÔNG truyền cờ hay biến `VITE_DUCKER_*`; chỉ truyền
  `VITE_BASE_PATH`. Bật thật là một thay đổi `deploy.yml` riêng.
- Profile Ducker ID chỉ giữ **trong bộ nhớ**; tải lại trang = đăng xuất. Lỗi xác thực
  hạ về signed-out âm thầm. Đăng xuất không đụng phiên ở Ducker ID.
- **`base` đổi từ `'./'` sang `VITE_BASE_PATH`** (`/` local, `/<tên repo>/` ở Pages).
  `redirect_uri` OAuth phải là URL tuyệt đối khớp từng ký tự với URI đã đăng ký, và
  `'./'` không cho ra URL nào như thế. Asset Phaser nạp qua `import.meta.env.BASE_URL`
  nên vẫn đúng với base tuyệt đối (đã kiểm trên bản build `/web-game-duck-defense/`).
- **`.env.example` không còn "không có biến nào"** (ADR-0007 §2): giờ có sáu biến, mô tả
  trong file đó.
- Không thêm dependency nào. Test component dùng `react-dom/client` + `act` + jsdom
  (đã có), không thêm React Testing Library.

### Ngoại lệ có giới hạn của NFR

> sessionStorage key `ducker.pkce` và không gì khác, xoá ngay khi quay lại; mạng chỉ tới
> issuer đã cấu hình, và tới URL ảnh đại diện mà nó trả về (có thể ở host khác), chỉ sau khi đăng nhập; không gì cả khi cờ tắt.

- **NFR-DATA-04** ("không gọi mạng nào ngoài asset tĩnh và Google Fonts"): ngoại lệ trên.
  Kiểm bằng e2e `ducker-sign-in-off.spec.ts` (cờ tắt ⇒ không request ngoài, không
  `ducker.pkce`) và `ducker-sign-in.spec.ts` (cờ bật, issuer giả).
- **NFR-DATA-01** (trường PII): khi người chơi đăng nhập, tên/email/ảnh từ Ducker ID
  được giữ trong bộ nhớ đến khi đăng xuất hoặc tải lại. Không ghi `localStorage`.
- **NFR-SEC-04** (không secret): vẫn đúng. Public client, không `client_secret`; mọi
  biến `VITE_*` công khai.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ `base: './'`, suy `redirect_uri` từ `location` | Phụ thuộc đường dẫn người chơi đang đứng; redirect_uri phải cố định và đã đăng ký |
| Giá trị mặc định (issuer `localhost`, scope `openid`) trong code | Người dùng cấm rõ. Một mặc định sai lặng lẽ trỏ bản production về localhost |
| Lưu token/profile vào `localStorage` | Mở rộng bề mặt PII và NFR-DATA-04; đăng nhập chỉ để hiện tên, không đáng giữ |
| Thêm React Testing Library | Thêm dependency chỉ để vài test; `act` + jsdom đủ |
| Bật cờ ở `deploy.yml` | Chưa phát hành; client chưa đăng ký ở Ducker ID |

## 4. Hệ quả

**Được:** đăng nhập danh tính tuỳ chọn mà game vẫn offline-first khi tắt; cấu hình đúng
một chỗ; `base` tuyệt đối cho phép redirect_uri chính xác.

**Mất / phải chấp nhận:**
- **Nợ `[skip release]`:** mọi commit của nhánh này mang `[skip release]` theo lựa chọn
  của người dùng. `release.yml` quét cả khoảng từ tag gần nhất, nên mọi push sau đó
  lên `main` cũng bị bỏ qua cho đến khi có tag mới. Release kế tiếp phải cắt tay một
  lần: `pnpm release:next` → `git tag vX.Y.Z && git push origin vX.Y.Z` →
  `gh release create vX.Y.Z --notes "$(pnpm -s release:notes)"`. Sau đó tự động hoá chạy lại.
- Tải lại trang là đăng xuất (không persist) — chấp nhận để giữ PII ngoài đĩa.
- Bản build local phải có `.env` (`VITE_BASE_PATH=/`) nếu muốn thấy nút; mặc định không có.

**Điều kiện xem lại:** khi bật thật ở Pages (đăng ký client, truyền biến trong `deploy.yml`),
hoặc khi Ducker ID có trang đăng ký dùng chung và nhu cầu đồng bộ tiến trình.
