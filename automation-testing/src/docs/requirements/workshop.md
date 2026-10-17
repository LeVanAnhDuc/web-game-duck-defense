# WORKSHOP — Xưởng nâng cấp: cây bốn nhánh, mua bằng lõi, điều kiện tiên quyết

Truy vết phía app: FR-11 · FR-12 · FR-27 · US-02 bước 4–6 + "Điều gì có thể sai" · NFR-REL-02 · invariants #8.

- **REQ-WORKSHOP-01** Xưởng có bốn nhánh — Kinh tế, Sát thương, Tiện ích, Mở khoá: từ 1024px bốn cột cùng lúc, hẹp hơn thì thành bốn tab (mặc định Kinh tế). Đầu màn hiện số lõi đang giữ; chân màn "Đã đầu tư n / 5545 lõi".
- **REQ-WORKSHOP-02** Mua một bậc trừ đúng giá của bậc đó, node hiện "Bậc k / max", nút mua đổi sang giá bậc kế, và dòng "Đã đầu tư" tăng đúng số vừa trả.
- **REQ-WORKSHOP-03** Không đủ lõi cho bậc kế thì nút mua bị vô hiệu hoá; vừa đúng bằng giá thì mua được.
- **REQ-WORKSHOP-04** Node có điều kiện tiên quyết chưa đạt hiện "Khoá" kèm LÝ DO "Cần <node> bậc N" và không có nút mua; đạt điều kiện thì node mở ra mua được.
- **REQ-WORKSHOP-05** Node đã ở bậc tối đa hiện "Đã tối đa" và không còn nút mua.
- **REQ-WORKSHOP-06** Bấm mua hai lần rất nhanh không bao giờ trừ hai lần cùng một giá: mỗi lần trừ đổi lấy đúng một bậc ở giá của bậc đó, và khi chỉ đủ lõi cho một bậc thì chỉ trừ một lần.
- **REQ-WORKSHOP-07** Nâng cấp đã mua được lưu (còn nguyên sau tải lại) và áp cho trận sau: "Tiền khởi đầu" cộng 50 vàng mỗi bậc khi vào trận; "Tháp Sét" thêm thẻ tháp Sét vào bảng xây.
