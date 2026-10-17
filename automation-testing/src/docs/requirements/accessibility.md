# ACCESSIBILITY — Bàn phím, focus, vùng bấm, nhãn cho screen reader, giảm chuyển động

Truy vết phía app: FR-19 · FR-29 · FR-36 · NFR-A11Y-02 · NFR-A11Y-03 · NFR-A11Y-05 · NFR-A11Y-07 · README §Controls.

- **REQ-ACCESSIBILITY-01** Đặt được tháp CHỈ bằng bàn phím: Tab tới một ô (lớp nút DOM trên canvas), Enter chọn ô mà không trả tiền, Tab tới nút "XÂY · <giá>", Enter xây; trong suốt quá trình vòng focus thấy được.
- **REQ-ACCESSIBILITY-02** Focus không bao giờ rơi về `<body>`: cả khi vào trận bằng bàn phím (nút vừa bấm biến mất) lẫn khi nút gọi đợt tự tắt ngay sau khi bấm.
- **REQ-ACCESSIBILITY-03** Phím tắt trong trận: `1` `2` `3` chọn Cung / Pháo / Băng; Esc bỏ chọn; Space gọi đợt khi không có nút nào đang giữ focus.
- **REQ-ACCESSIBILITY-04** Space trên một nút đang giữ focus bấm CHÍNH nút đó (vd "Nâng"), không gọi đợt.
- **REQ-ACCESSIBILITY-05** Ở màn chạm hẹp 375px, vùng bấm của các ô xây, thẻ tháp, nút gọi đợt, nút quay lại và tạm dừng đều ít nhất 44×44px.
- **REQ-ACCESSIBILITY-06** Canvas có nhãn văn bản thay thế: một vùng `aria-live` đọc đợt, mạng và vàng của trận, và cập nhật khi chúng đổi.
- **REQ-ACCESSIBILITY-07** Người chơi bật "giảm chuyển động" của hệ điều hành thì chuyển động của giao diện tắt (nút không còn hiệu ứng chuyển tiếp).
