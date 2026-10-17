# MAPSELECT — Chọn bản đồ: trạng thái, lý do khoá, vào trận

Truy vết phía app: FR-13 · FR-26 · FR-34 · FR-35 · US-03 · NFR-A11Y-06 · invariants #13.

- **REQ-MAPSELECT-01** Màn chọn bản đồ có năm thẻ theo thứ tự, mỗi thẻ có số thứ tự, tên và trạng thái. Người mới: thẻ 1 "Chưa qua" kèm "Chưa chơi lần nào"; thẻ 2–5 "Chưa mở" (chữ + icon khoá, không chỉ màu) kèm lý do "Cần qua <bản đồ trước> để mở".
- **REQ-MAPSELECT-02** Bản đồ đã qua hiện "Đã qua" và "N / N đợt · còn L mạng"; bản đồ đã chơi mà chưa qua hiện "Kỷ lục: đợt X / N"; bản đồ ngay sau một bản đồ đã qua thì mở.
- **REQ-MAPSELECT-03** Bấm một thẻ đang mở vào trận của đúng bản đồ đó; thẻ đang khoá không bấm được và không vào trận.
- **REQ-MAPSELECT-04** Ở bề rộng 375px mọi thẻ hiện trọn tên, trạng thái và dòng chi tiết/lý do khoá — không chữ nào bị cắt hay ép về 0, kể cả khi năm thẻ không vừa một màn.
- **REQ-MAPSELECT-05** Màn chọn bản đồ cho thấy số lõi đang giữ và có lối sang xưởng nâng cấp.
