# Danh mục chức năng

> **Trả lời:** Hệ thống có những chức năng nào, mỗi cái đang ở trạng thái gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** brainstorm ra chức năng mới (cấp FR mới) · một FR chuyển trạng thái

<!-- CÁCH ĐIỀN
Chỉ LIỆT KÊ. Một dòng một chức năng, tên ngắn. Cách làm thuộc tài liệu thiết kế
của feature, không thuộc đây.

ID cấp tăng dần, không tái dùng, không xoá. Bỏ một chức năng thì đổi trạng thái
thành (bỏ) và giữ số — vì commit và test cũ vẫn tham chiếu ID đó.

Trạng thái: chưa · đang · xong · (bỏ)

KHÔNG chứa: cách hiện thực, ngưỡng phi chức năng (-> nfr.md), lý do chọn giải pháp
(-> decisions/).
-->

## Lõi mô phỏng một trận

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-01 | Enemy đi trên polyline vẽ sẵn, tốc độ riêng theo loại | US-01 | xong |
| FR-02 | Sinh enemy theo lịch đợt của từng bản đồ | US-01 | xong |
| FR-03 | Tháp ngắm mục tiêu và bắn theo nhịp hồi | US-01 | xong |
| FR-04 | Đạn bay, trúng, gây sát thương (đơn mục tiêu và nổ lan) | US-01 | xong |
| FR-05 | Kinh tế trong trận: tiền khởi đầu, tiền rơi, giá xây, giá nâng, giá bán | US-01 | xong |
| FR-06 | Mạng: enemy tới cuối đường thì trừ mạng; hết mạng thì thua | US-01 | xong |
| FR-07 | Điều kiện thắng: hết đợt cuối và không còn enemy trên bản đồ | US-01 | xong |
| FR-20 | Hiệu ứng làm chậm của tháp Băng, có thời hạn và không cộng dồn | US-01 | xong |
| FR-21 | Giáp: giảm sát thương phẳng; có loại tháp xuyên giáp | US-01 | xong |

## Thao tác trong trận

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-08 | Chọn ô trống rồi xây tháp vào đó (hai bước, không xây do chạm nhầm) | US-01 | xong |
| FR-09 | Chọn tháp đã xây để nâng cấp hoặc bán | US-02 | xong |
| FR-10 | Đổi tốc độ trận x1 / x2 / x3, và tạm dừng | US-01 | xong |
| FR-22 | Gọi đợt tiếp theo sớm hơn lịch | US-01 | xong |
| FR-23 | Hiện tầm bắn của tháp đang chọn | US-01 | xong |
| FR-24 | Xem trước thành phần đợt tiếp theo | US-01 | xong |

## Tiến trình giữa các trận

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-11 | Profile lưu trong máy: `cores`, bậc nâng cấp, tháp đã mở, kết quả từng bản đồ | US-02 | xong |
| FR-12 | Cây nâng cấp toàn cục: bốn nhánh, node có điều kiện tiên quyết và bậc | US-02 | xong |
| FR-13 | Mở bản đồ theo tiến trình, và hiện **lý do** khi còn khoá | US-03 | xong |
| FR-16 | Trao `cores` sau trận, thưởng lớn cho lần thắng đầu, giảm mạnh khi chơi lại | US-02 | xong |
| FR-25 | Đọc profile phòng vệ: bản hỏng hoặc sai phiên bản thì giữ lại, không xoá | US-03 | xong |

## Màn hình

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-14 | Màn tiêu đề, một hành động chính | US-01 | xong |
| FR-15 | Màn kết quả trận: thắng/thua, số đợt, `cores` nhận được | US-01 | xong |
| FR-26 | Màn chọn bản đồ | US-03 | xong |
| FR-27 | Màn xưởng nâng cấp | US-02 | xong |
| FR-28 | Màn cài đặt | US-04 | xong |

## Vỏ và hệ thống

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-17 | Đổi ngôn ngữ vi ↔ en không tải lại trang | US-04 | xong |
| FR-18 | Âm lượng **hiệu ứng** âm thanh, tắt được. **Đã thu hẹp:** v1 không có nhạc nền, nên chỉ còn MỘT thanh trượt — một thanh trượt điều khiển thứ không tồn tại thì tệ hơn là không có. Lý do ở `backlog.md` §Nợ kỹ thuật | US-04 | xong (thu hẹp) |
| FR-19 | Tôn trọng `prefers-reduced-motion` — chuyển động của chrome tắt hết qua CSS toàn cục. **Không có hiệu ứng hạt nào trong canvas để giảm**, nên phần đó của yêu cầu là ⚪ chưa áp dụng, không phải chưa làm | US-04 | xong |
| FR-29 | Điều khiển bằng bàn phím cho toàn bộ thao tác trong trận | US-01 | xong |
| FR-30 | Bố cục thật ở 375 · 768 · 1024 · 1440, cả hai chiều xoay | US-01 | xong |

## Công cụ nội bộ — không phải chức năng người chơi thấy

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-31 | Chạy trọn một trận không cần trình duyệt (mô phỏng headless) | — | xong |
| FR-32 | Test khẳng định mỗi bản đồ thắng được ở mức nâng cấp tối thiểu | — | xong |
