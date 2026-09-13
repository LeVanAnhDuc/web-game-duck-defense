# ADR-0007 · Dùng `base: './'` thay cho base tuyệt đối theo tên repo

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** ADR-0006 · NFR-REL-03 · NFR-SEC-04 · NFR-DATA-05

## 1. Bối cảnh

ADR-0006 chốt deploy tĩnh lên GitHub Pages, và hệ quả ghi ở §4 của nó là "`base`
của Vite phải đặt đúng, sai chỗ này thì local chạy mà production trắng màn hình".
Cách hiện thực ban đầu là một biến môi trường: `GITHUB_PAGES=true` bật
`base = '/web-game-tower-defense/'`.

Hai chuyện xảy ra sau đó, và cả hai đều là hệ quả của việc viết cứng một base
tuyệt đối:

1. **Repo trên GitHub tên `web-game-duck-defense`**, không trùng tên thư mục
   local. Một base viết cứng theo tên nào đó là một hằng số phải nhớ cập nhật
   mỗi lần đổi tên — và quên nó thì lỗi chỉ lộ ra sau khi deploy.
2. **`vite preview` không kiểm được một build có base là đường dẫn con.** Nó
   phục vụ `dist/` ở gốc, nên `/web-game-.../assets/index-*.js` rơi vào SPA
   fallback và trả về HTML. Trang không boot, và người kiểm kết luận sai rằng
   `base` đặt sai. Để kiểm cho đúng đã phải viết thêm `scripts/preview-pages.mjs`
   — một static server chỉ tồn tại để bù cho lựa chọn base.

## 2. Quyết định

`base: './'` — đường dẫn tương đối. Cùng một bản build chạy đúng ở gốc tên miền,
dưới đường dẫn con của Pages, và trong `vite preview`.

Kéo theo: xoá `scripts/preview-pages.mjs` và script `preview:pages`, xoá biến
`GITHUB_PAGES` và `PORT` khỏi `.env.example` — dự án trở lại **không đọc biến môi
trường nào**, và lần này là thật.

Cùng cách các game khác trong `web-game/` làm (tetris: ADR-0011 của nó).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ `GITHUB_PAGES` + base tuyệt đối | Một hằng số phải nhớ đồng bộ với tên repo, và sai nó chỉ lộ ra ở production |
| Đọc tên repo từ `GITHUB_REPOSITORY` trong CI | Build local không có biến đó, nên bản local và bản CI khác base — đúng thứ vừa gây rắc rối, chỉ tự động hơn |
| Giữ base tuyệt đối và giữ `preview-pages.mjs` | Giữ một static server tự viết chỉ để kiểm một thứ mà `'./'` làm biến mất |
| Deploy vào gốc một tên miền riêng | Vượt trần $0 của `overview.md` §5 |

## 4. Hệ quả

**Được:**
- Đổi tên repo không làm hỏng deploy.
- `pnpm preview` kiểm được đúng bản sẽ lên production.
- `.env.example` thật sự rỗng, khớp với NFR-SEC-04.
- Bớt một script và một npm script phải bảo trì.

**Mất / phải chấp nhận:**
- Đường dẫn tương đối vỡ nếu về sau thêm **router có nhiều mức đường dẫn**
  (`/maps/m01`): trang ở độ sâu 2 sẽ giải `./assets/...` sai. Hiện không có
  router (ADR-0006 §4: một SPA một màn), nên chưa phải vấn đề.
- Không dùng được `<base href>` hay đường dẫn tuyệt đối trong HTML tĩnh nữa.

**Điều kiện xem lại quyết định này:** thêm client-side routing có nhiều mức
đường dẫn · hoặc chuyển sang hosting phục vụ ở gốc tên miền.
