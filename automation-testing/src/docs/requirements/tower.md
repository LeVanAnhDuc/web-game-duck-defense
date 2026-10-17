# TOWER — Tháp đã xây: xem, nâng cấp, bán

Truy vết phía app: FR-09 · FR-05 · US-01 bước 7 · NFR-A11Y-07.

- **REQ-TOWER-01** Chọn một tháp đã xây hiện panel của nó: "<tên> · Bậc N", "Bậc N / 3", sát thương hiện tại kèm sát thương bậc kế, nút "Nâng <giá>" và "Bán +<giá bán>"; ô đó đọc là "<tên> bậc N ở ô số K".
- **REQ-TOWER-02** "Nâng" trừ đúng giá nâng và panel làm mới ngay: bậc tăng, sát thương mới, và giá nâng đổi sang giá của bậc kế — không đứng ở giá cũ.
- **REQ-TOWER-03** Ở bậc cuối panel nói "Đã tối đa" và không còn nút "Nâng".
- **REQ-TOWER-04** Không đủ vàng để nâng thì nút "Nâng" bị vô hiệu hoá.
- **REQ-TOWER-05** "Bán" trả lại một nửa tổng số đã tiêu cho tháp (giá xây + các lần nâng), làm tròn xuống; tháp biến mất và ô đó xây lại được.
- **REQ-TOWER-06** Ô đã xây mà không được chọn đọc là "Ô số N — đã xây", ô trống đọc là "Ô số N" — người dùng screen reader phân biệt được ô nào còn trống.
