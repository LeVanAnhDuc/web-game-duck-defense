# Dò năng lực trình duyệt — 2026-09-11

Đo bởi phiên điều phối, TRƯỚC khi chạy persona. Giữ lại để phiên sau không phải đo lại.

## Đích đo
`https://levananhduc.github.io/web-game-duck-defense/` — HTTP 200, `<title>Duck Defense</title>`.
Đối chiếu dấu hiệu nhận biết (SKILL.md): ĐÚNG APP.
- Màn tiêu đề: CHƠI · Chọn bản đồ · Xưởng nâng cấp · "Đã mở 1 / 5 bản đồ" · "0 Lõi" · Cài đặt · VI/EN
- Màn trận: `<canvas>` bản đồ · "Đợt 1/12 · Mạng 20 · Vàng 260" · shop Cung 60 / Pháo 110 / Băng 90
  · "GỌI ĐỢT TIẾP THEO" · gợi ý phím tắt "1 2 3 chọn tháp · Space gọi đợt · Esc bỏ chọn"

## Công cụ: playwright (hạng 1) — nhưng KHÔNG đủ isolation

| Năng lực | Có? | Ghi chú |
| --- | --- | --- |
| điều hướng · click · nhập liệu · chụp màn hình · đọc console | có | qua `mcp__plugin_playwright_playwright__*` |
| đặt viewport | có | `browser_resize` |
| **throttle mạng** | **KHÔNG** | xem dưới |
| context riêng mỗi phiên | **KHÔNG** | 1 browser · 1 context · 1 page |

### Throttle — đo được là không ăn
CDP `Network.emulateNetworkConditions` (latency 400ms, 400 kbps) qua `browser_run_code_unsafe`:
tải `assets/index-DPgpY2C4.js` (1436 KB, `cache: no-store`) — throttled **8915 ms** vs
không throttle **8727 ms**. Không khác nhau ⇒ emulation không có tác dụng.
`context.route()` có chèn được độ trễ (+~2.2s) và **sống qua nhiều lần gọi**, nhưng sandbox
của `run_code_unsafe` **không có `setTimeout` / `require`** nên chỉ delay được bằng
`page.waitForTimeout` — thô, không mô phỏng được băng thông.

### Đường mạng nền (đo thật, lặp lại được)
Trong trình duyệt Playwright, `cache: no-store`:
`/` 1 KB → 448/478 ms · `.css` 26 KB → 544 ms · `.js` **1436 KB → 8589 ms**
⇒ **~1.4 Mbps, RTT ~450 ms**. Xấp xỉ đúng preset "Slow 4G" của Chrome (1.6 Mbps / 400 ms).
`curl` trên cùng máy: 1470 KB trong **0,42–0,78 s** (~15–24 Mbps) ⇒ đường chậm là của
trình duyệt Playwright, không phải của GitHub Pages. **Không phải nhiễu nhất thời** — đo 4 lần.

### Quyết định của người dùng (2026-09-11)
Chạy đủ 7 phiên, mô phỏng điều kiện mạng bằng **HTTP cache**:
- p01 Trang · p07 Bà Ngà (Slow 4G) → **cache lạnh** trên đường ~1.4 Mbps ⇒ first load ~9 s
- p02 · p03 · p04 · p05 · p06 (wifi ổn / cáp quang) → **làm nóng cache trước phiên**
Phải ghi rõ cách mô phỏng này ở §Ghi chú về chính lần chạy này của báo cáo.

### Hệ quả: chạy TUẦN TỰ, không song song
1 context dùng chung ⇒ không có 4 phiên đồng thời, và localStorage bị lẫn giữa các persona.
Game này giữ toàn bộ tiến độ trong localStorage nên đây là chuyện sống còn:
- Trước p01 · p02 · p03 · p05 · p06 · p07: **xoá sạch** localStorage + sessionStorage + cookie
- Trước p04 (RR-03, người quay lại): **dựng sẵn** tiến độ ≥ 1 bản đồ đã thắng, rồi mới dispatch

## Lỗi console đã thấy ở màn tiêu đề
`404 https://levananhduc.github.io/favicon.ico` — thiếu favicon. Vặt, nhưng có thật.

## Vướng còn lại
`.claude/agents/ux-persona.md` khai `tools: mcp__playwright__*`, không khớp tên server thật
`plugin_playwright_playwright` ⇒ persona không chạm được trình duyệt. Đã sửa dòng `tools:`
thành danh sách tên tool đầy đủ (đúng như comment trong chính file đó dặn).

---

## Lần thử 2 (sau khi khởi động lại phiên) — VẪN CHẶN, lý do khác

Khởi động lại đã sửa được vướng cũ: `.claude/agents/ux-persona.md` giờ khai đúng tên tool.
Nhưng lần này **không còn trình duyệt nào** để chạy.

| Hạng | Công cụ | Trạng thái |
| --- | --- | --- |
| 1 | `playwright` | `CONNECT_TIMEOUT` — MCP server quá 30000ms |
| 2 | `chrome-devtools-mcp` | bật trong `settings.local.json` nhưng không có tool nào hiện ra |
| 3 | `claude-in-chrome` | "Browser extension is not connected" |

### Nguyên nhân playwright, và cách sửa
`~/.claude/plugins/.../playwright/.mcp.json` chạy `npx @playwright/mcp@latest`.
`@latest` bắt npx hỏi registry mỗi lần khởi động — trên đường mạng chậm là quá 30s.

Đã làm nóng cache: `npx --yes @playwright/mcp@latest --version` → `Version 0.0.80`,
lần đầu 11,1s, lần sau 8,8s (dưới trần 30s). Browser binary có đủ:
`chromium-1243`, `chromium_headless_shell-1243`, `ffmpeg-1011`.
⇒ Chỉ cần **kết nối lại server** là chạy được, không phải cài gì thêm.
