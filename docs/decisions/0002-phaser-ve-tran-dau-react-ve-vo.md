# ADR-0002 · Phaser 3 vẽ trận đấu, React vẽ toàn bộ vỏ giao diện

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** FR-14 · FR-26 · FR-27 · FR-28 · NFR-A11Y-02 · NFR-A11Y-03 · NFR-A11Y-07 · NFR-I18N-01 · NFR-I18N-04

## 1. Bối cảnh

Cần chọn cách vẽ cho một game tower defense 2D chạy web, có sprite Kenney (nên cần
loader, texture atlas, tilemap, âm thanh, scale manager), và có yêu cầu "tối ưu mọi
thiết bị" cộng bộ NFR-A11Y đầy đủ. Phần nhiều chữ nhất của game không phải bàn chơi
mà là **cây nâng cấp toàn cục** và các màn menu.

## 2. Quyết định

Chia theo bề mặt, không theo tính năng. **Phaser 3** vẽ đúng một thứ: bãi chiến
trường trong `<canvas>`. **React 19** vẽ mọi thứ còn lại như DOM thật — màn tiêu đề,
chọn bản đồ, xưởng nâng cấp, cài đặt, màn kết quả, và **cả thanh HUD** nằm chồng lên
canvas. Hai bên chỉ gặp nhau ở `bridge/` (ADR-0004).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| PixiJS + tự viết game loop | Pixi chỉ là renderer. Phải tự viết loader, atlas, tilemap, sound manager, scale manager, chuyển scene — công sức đổ vào hạ tầng thay vì vào game, cho một sản phẩm chỉ có 5 bản đồ |
| Canvas 2D thuần, không thư viện | Cùng lý do, nặng hơn: sẽ tự viết một Pixi tệ hơn Pixi |
| Vẽ cả UI trong Phaser | Chữ vẽ trong canvas **không có** focus, không có screen reader, không co theo CSS, và tràn khi đổi sang tiếng Việt mà không ai biết. Cây nâng cấp là màn nhiều chữ nhất — vẽ trong canvas là tự chuốc khổ. NFR-A11Y-02/03/07 và NFR-I18N-04 gần như miễn phí trong DOM và rất đắt trong canvas |
| Vỏ bằng TypeScript thuần + CSS, không React | Cây nâng cấp có nhiều state phụ thuộc nhau (đã mở gì, đủ tiền không, node nào bị chặn). Tự đồng bộ DOM với state đó là chỗ sẽ sinh lỗi nhất |

## 4. Hệ quả

**Được:**
- A11y, responsive và i18n do trình duyệt và CSS lo, không phải tự dựng lại.
- Bố cục đổi theo bề rộng và chiều xoay bằng CSS, không cần tính toán trong game.
- Sửa một màn menu không có nguy cơ làm hỏng vòng chơi.

**Mất / phải chấp nhận:**
- Hai thế giới phải đồng bộ, cần một cầu nối tường minh — đó là cả một module
  (`bridge/`) và một bất biến (snapshot ≤ 10Hz).
- Phaser thêm ~250 KB gzip vào bundle, ăn phần lớn ngân sách NFR-PERF-08.
- Một sprite 16px trong canvas và một nút 16px trong HUD **không** cùng kích thước
  trên màn hình. Không được cố khớp chúng.

**Điều kiện xem lại quyết định này:** game cần UI vẽ bên trong không gian bàn chơi
theo toạ độ thế giới (thanh máu bám sát enemy là đã có, nhưng nếu cần menu radial
quanh tháp thì phải xét lại) · hoặc bundle vượt trần NFR-PERF-08 vì Phaser.
