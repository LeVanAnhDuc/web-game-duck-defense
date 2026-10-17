# BUILD — Xây tháp ba bước: chọn ô, chọn loại, xác nhận

Truy vết phía app: FR-08 · FR-33 · FR-23 · FR-05 · FR-29 · US-01 bước 3–5 + "Điều gì có thể sai" · NFR-A11Y-06 · ADR-0009.

- **REQ-BUILD-01** Chạm một ô trống chỉ CHỌN ô (ô được đánh dấu đang chọn), không trừ vàng; bảng xây hiện ba thẻ tháp kèm giá (Cung 60, Pháo 110, Băng 90) và nút xác nhận ghi "Chọn một loại tháp", chưa bấm được.
- **REQ-BUILD-02** Chạm một thẻ tháp chỉ CHỌN loại tháp (thẻ được đánh dấu), không trừ vàng; số liệu của loại đó (sát thương, tầm bắn, nhịp bắn bằng giây) hiện TRƯỚC khi trả tiền, và nút xác nhận đổi thành "XÂY · <giá>".
- **REQ-BUILD-03** Chỉ bấm "XÂY · <giá>" mới trả tiền: vàng giảm đúng giá, ô thành ô đã xây (đọc là "Ô số N — đã xây" khi không còn được chọn), và chọn lại ô đã xây không mở bảng xây chồng lên nó.
- **REQ-BUILD-04** Không đủ vàng cho một loại tháp thì thẻ đó bị vô hiệu hoá và mang dấu hiệu khác màu (icon khoá thay icon xu); đủ vàng — kể cả vừa đúng bằng giá — thì thẻ vẫn chọn và xây được.
- **REQ-BUILD-05** "Huỷ" hoặc phím Esc bỏ chọn cả ô lẫn loại tháp, không trừ vàng.
- **REQ-BUILD-06** Chọn loại tháp trước (thẻ, hoặc phím 1 / 2 / 3) rồi chạm ô vẫn không tự xây: vẫn cần bấm nút xác nhận.
- **REQ-BUILD-07** Chạm lại đúng thẻ đang chọn thì bỏ chọn loại tháp: nút xác nhận về "Chọn một loại tháp".
