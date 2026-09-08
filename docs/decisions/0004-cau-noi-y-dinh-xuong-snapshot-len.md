# ADR-0004 · Cầu nối một chiều: ý định đi xuống, snapshot 10Hz đi lên

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** ADR-0002 · ADR-0003 · FR-08 · FR-09 · FR-10 · FR-22 · NFR-PERF-05 · NFR-PERF-07

## 1. Bối cảnh

ADR-0002 đặt React và Phaser vào cùng một tab. Chúng phải nói chuyện: HUD hiện tiền
và mạng đang thay đổi liên tục, và người chơi bấm nút trong HUD để tác động vào trận.
Cách làm hiển nhiên — cho React đọc trực tiếp state trận và render mỗi frame — là
cách sẽ giết hiệu năng trên điện thoại, và triệu chứng lại là *"game giật"* chứ không
phải *"UI chậm"*, nên sẽ bị đi tìm sai chỗ.

## 2. Quyết định

Một module `bridge/`, là chỗ **duy nhất** hai bên gặp nhau, và cố ý hẹp theo hai chiều:

- **Xuống:** React đẩy **ý định** vào một hàng đợi — `placeTower`, `sellTower`,
  `upgradeTower`, `setSpeed`, `pause`, `startWave`. Không bao giờ đẩy state. `game/`
  rút hàng đợi và áp chúng ở **ranh giới tick**, không phải ngay lúc chạm.
- **Lên:** `game/` đẩy một **snapshot rút gọn** — tiền, mạng, đợt, thực thể đang
  chọn — ở **≤ 10Hz**, không phải mỗi frame. React đọc snapshot đó.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| React đọc state trận và render mỗi frame | 60 lần re-render mỗi giây trên điện thoại làm rớt frame của cả game. Và React không cần biết 59 trong 60 giá trị đó — mắt người không đọc được số tiền đổi 60 lần/giây |
| React giữ state trận trong store (Redux/Zustand), Phaser đọc từ đó | Đảo ngược quyền sở hữu: vòng chơi phải chờ tầng UI. Và mọi cập nhật theo tick lại thành một lần dispatch |
| Phaser gọi callback của React trực tiếp mỗi khi có gì đổi | `game/` phải biết React tồn tại, phá ranh giới trong `architecture.md` §3. Và số lần gọi lại về đúng tần số frame |
| Áp ý định ngay lúc người chơi chạm, không chờ ranh giới tick | Tháp vừa xây có thể bắn trong cùng tick nó xuất hiện, và thứ tự hai thao tác gần nhau đổi kết quả trận. Không tái tạo được |
| Dùng `CustomEvent` trên `window` làm cầu nối | Mất kiểu, không grep ra được ai lắng nghe cái gì, và `core/` bị buộc phải biết `window` |

## 4. Hệ quả

**Được:**
- Ranh giới rõ và grep ra được: mọi giao tiếp hai chiều nằm trong một thư mục.
- Vòng chơi giữ quyền sở hữu state, tầng UI chỉ là người xem.
- Hiệu năng UI không còn dính vào tần số frame (NFR-PERF-07).

**Mất / phải chấp nhận:**
- HUD trễ tối đa 100ms so với trận. Với tiền và mạng thì không ai thấy; với **thanh
  máu của enemy** thì thấy ngay — nên thanh máu vẽ **trong canvas**, không phải trong
  HUD. Đây là hệ quả trực tiếp, không phải ngoại lệ.
- Ý định trễ tối đa một tick (~16ms) trước khi có hiệu lực. Không cảm nhận được, và
  đổi lại là tính tái tạo được.
- Thêm một lớp phải giữ đồng bộ: một kiểu ý định mới cần sửa cả ba bên.

**Điều kiện xem lại quyết định này:** cần một chỉ số phải cập nhật theo frame **trong
DOM** (chưa có cái nào) · hoặc mô phỏng chuyển sang Web Worker, lúc đó cầu nối trở
thành `postMessage` và ranh giới này càng đúng hơn.
