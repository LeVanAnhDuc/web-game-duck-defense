# RESPONSIVE — Bố cục thật ở 375 · 768 · 1024 · 1440, cả hai chiều xoay

Truy vết phía app: FR-30 · US-01 "Xoay điện thoại giữa trận" · invariants #12 · `MASTER.md` §6.

- **REQ-RESPONSIVE-01** Không màn nào cuộn ngang ở năm mốc 375×812, 812×375, 768×1024, 1024×768, 1440×900: màn tiêu đề, chọn bản đồ, xưởng, cài đặt và trận.
- **REQ-RESPONSIVE-02** Canvas trận vừa khít khung bàn chơi ngay từ lúc vào trận, không cần một lần resize: không lớn hơn khung (bị cắt mất hàng ô, phủ lên thanh điều khiển).
- **REQ-RESPONSIVE-03** Trận có ba bố cục — dọc (thanh trên + thanh đáy), ngang hẹp (hai dải mép), rộng (thanh trên + cột phải + thanh đáy) — và ở mỗi bố cục chip vàng, chip mạng, chọn tốc độ và nút gọi đợt đều nằm trọn trong màn hình.
- **REQ-RESPONSIVE-04** Xoay máy (dọc ↔ ngang) giữa trận không reset trận: vàng, tháp đã xây và đợt giữ nguyên.
- **REQ-RESPONSIVE-05** Ở bố cục ngang hẹp, luồng xây ba bước vẫn đi hết được: chọn ô, chọn thẻ tháp, và nút xác nhận có mặt để xây.
