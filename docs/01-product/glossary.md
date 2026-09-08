# Thuật ngữ

> **Trả lời:** Khái niệm này gọi là gì trong code, và hiện ra sao trên UI?
> **Trạng thái:** 🟡 một phần
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** xuất hiện một khái niệm nghiệp vụ mới trong code hoặc UI

<!-- CÁCH ĐIỀN
File này KHOÁ TÊN GỌI. Mục đích: mọi phiên làm việc đặt tên biến / bảng / route
giống nhau, thay vì mỗi lần tự nghĩ ra một tên mới cho cùng một khái niệm.

Chỉ thêm dòng khi khái niệm ĐÃ xuất hiện trong code hoặc UI. Bảng đầy khái niệm
tưởng tượng thì vô dụng.

Đổi trạng thái sang 🟡 ngay khi có dòng thật đầu tiên.
KHÔNG chứa: giải thích nghiệp vụ dài (-> overview.md).
-->

🟡 vì cột "Tên trong code" là **cam kết**, chưa phải mô tả: các tên UI đã chốt qua
mockup được duyệt, còn code thì đang dựng. Đổi sang 🟢 khi `core/` và `ui/` đã tồn tại
và tên trong đó khớp bảng này.

| Thuật ngữ | Định nghĩa một câu | Tên trong code | Tên trên UI (VI) | Tên trên UI (EN) |
| --- | --- | --- | --- | --- |
| Tower | Một công trình phòng thủ đặt trên một slot, có bậc nâng cấp trong trận | `Tower` | Tháp | Tower |
| Slot | Một ô cố định trên bản đồ được phép đặt tháp | `Slot` | Ô | Slot |
| Enemy | Một thực thể đi trên đường và trừ mạng nếu tới cuối | `Enemy` | Địch | Enemy |
| Wave | Một nhóm enemy sinh ra theo lịch, đánh số từ 1 | `Wave` | Đợt | Wave |
| Path | Polyline vẽ sẵn của một bản đồ, enemy đi trên nó | `Path` | Đường | Path |
| Progress | Quãng đường một enemy đã đi trên `Path`, tính bằng đơn vị bản đồ | `s` | _(không hiện)_ | _(not shown)_ |
| Gold | Tiền **trong một trận**, kiếm từ enemy, mất khi hết trận | `gold` | Vàng | Gold |
| Core | Tiền **giữa các trận**, dùng mua nâng cấp toàn cục | `cores` | Lõi | Core |
| Life | Số lần enemy được phép tới cuối đường trước khi thua | `lives` | Mạng | Life |
| Upgrade node | Một mục trong cây nâng cấp toàn cục, có bậc và điều kiện tiên quyết | `UpgradeNode` | Nâng cấp | Upgrade |
| Branch | Một trong bốn nhánh của cây nâng cấp | `UpgradeBranch` | Nhánh | Branch |
| Profile | Toàn bộ dữ liệu lưu trong máy người chơi | `Profile` | _(không hiện)_ | _(not shown)_ |
| Battle | Một lượt chơi từ đợt 1 tới thắng hoặc thua | `Battle` | Trận | Battle |
| Map | Một bản đồ: lưới, đường, danh sách slot, lịch đợt | `MapDef` | Bản đồ | Map |
| Workshop | Màn hình mua nâng cấp toàn cục | `WorkshopScreen` | Xưởng nâng cấp | Workshop |
| Intent | Một ý định của người chơi, xếp hàng và áp ở ranh giới tick | `Intent` | _(không hiện)_ | _(not shown)_ |
| Snapshot | Bản rút gọn của state trận, đẩy sang React ở 10Hz | `BattleSnapshot` | _(không hiện)_ | _(not shown)_ |

**Tên bị cấm:**

- Dùng `Enemy`, **không** dùng `Monster` / `Creep` / `Mob` / `Unit`.
- Dùng `Wave`, **không** dùng `Round` / `Level` — `Level` chỉ dành cho **bậc nâng cấp
  của một tháp trong trận**, không bao giờ dùng cho một bản đồ hay một đợt.
- Dùng `Slot`, **không** dùng `Cell` / `Tile` / `Plot`. `Tile` chỉ nói về ô ảnh của
  tilemap khi vẽ, không nói về chỗ đặt tháp được.
- Dùng `gold` cho tiền trong trận và `cores` cho tiền giữa trận. **Không** dùng
  `money` / `coins` / `currency` cho cả hai — nhập nhèm hai loại tiền là lỗi kinh tế
  khó tìm nhất trong game này.
- Dùng `MapDef` cho dữ liệu bản đồ, **không** dùng `Level` / `Stage` / `Scene`.
  `Scene` là khái niệm của Phaser, giữ nguyên nghĩa đó.
- Dùng `s` cho quãng đường đã đi, **không** dùng `progress` / `distance` / `t` —
  `t` gợi ý 0..1 còn `s` là đơn vị thật của bản đồ.
