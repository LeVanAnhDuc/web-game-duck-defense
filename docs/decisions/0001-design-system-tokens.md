# ADR-0001 · Dùng Baloo 2 + Be Vietnam Pro trên nền petrol-cyan, thay vì bộ pixel-art 8-bit

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** NFR-A11Y-01 · NFR-A11Y-02 · NFR-A11Y-03 · NFR-A11Y-05 · NFR-I18N-01

## 1. Bối cảnh

Dự án cần một `MASTER.md` chốt màu, chữ và signature element trước khi có mockup đầu
tiên. Ba ràng buộc đã chốt từ buổi brainstorm định hình lựa chọn: game hiển thị **cả
tiếng Việt lẫn tiếng Anh, chuyển được**; **touch và chuột đều là công dân hạng nhất**;
và art dùng **Kenney Tower Defense pack (CC0)**.

`design-bootstrap` bước 1 (`ui-ux-pro-max --design-system`) trả về style *Pixel Art*,
cặp font `Press Start 2P` / `VT323`, và bảng màu near-black `#0F172A` với đỏ `#DC2626`
+ xanh lá `#22C55E`.

## 2. Quyết định

Giữ toàn bộ ràng buộc a11y/UX của bước 1, đè phần thẩm mỹ. Chốt: font hiển thị
**Baloo 2**, font thân **Be Vietnam Pro**; nền petrol `#101E27`, panel `#1D3442`, màu
tương tác cyan `#38BDC8`. Tách token thành hai họ không trộn — `--ui-*` cho chrome
(DOM/React) và `--sem-*` cho ngữ nghĩa luật chơi (canvas/Phaser). Signature element là
**cạnh dưới đặc 4px** trên mọi bề mặt bấm được, tụt xuống khi ấn.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| `Press Start 2P` (bước 1 đề xuất) | **Không có subset `vietnamese`** — kiểm bằng Google Fonts API, chỉ có latin / latin-ext / greek / cyrillic. Tiêu đề tiếng Việt sẽ rơi về font khác. Lỗi chức năng. |
| `Lilita One`, `Fredoka` | Cũng không có subset `vietnamese` (đã kiểm cùng lượt). |
| Style *Pixel Art* 8-bit | Sprite Kenney là hình phẳng bo tròn, không phải pixel art. Bước 1 suy ra từ chữ "pixel" trong câu truy vấn, không từ asset thật. |
| `#DC2626` làm primary | Bước 1 gán cùng một màu cho *primary* và *destructive*. Trong tower defense đỏ đã có nghĩa "mất máu"; nút chính cùng màu làm HUD ngừng truyền tin. |
| `#E5484D` cho trạng thái nguy hiểm | Đo được **3.31:1** trên `#1D3442` — trượt NFR-A11Y-01. Thay bằng `#FF7A7A` (5.13:1). |
| Độ nổi bằng `box-shadow` mờ | `rgba(0,0,0,.1)` trên nền `#101E27` là vô hình. |
| Affordance đặt vào `hover` | Cảm ứng không có hover. Vi phạm yêu cầu "tối ưu mọi thiết bị". |

## 4. Hệ quả

**Được:**
- Chuỗi tiếng Việt hiển thị đúng ở mọi vai trò chữ, không tofu, không fallback lặng lẽ.
- Mọi cặp màu chữ/nền trong `MASTER.md` đã **đo** ≥ 4.5:1, không ước lượng.
- Màu chrome và màu luật chơi không tranh nghĩa nhau.
- Signature element hoạt động y hệt trên touch, chuột và bàn phím, và gần như miễn phí dưới `prefers-reduced-motion`.

**Mất / phải chấp nhận:**
- Bỏ hẳn thẩm mỹ 8-bit hoài cổ — đây là lựa chọn thẩm mỹ, có người sẽ tiếc.
- Hai họ hàm chữ Google Fonts phải tải, kèm subset `vietnamese`; nặng hơn một font pixel bitmap.
- Phaser phải đọc màu từ CSS variable lúc khởi động thay vì hằng số — thêm một bước ở boot.

**Điều kiện xem lại quyết định này:** đổi bộ art sang pixel art thật · bỏ hỗ trợ
tiếng Việt · thêm chế độ nền sáng (bảng màu hiện tại chỉ dựng cho nền tối).
