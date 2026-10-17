# RESULT — Thắng, thua, màn kết quả và phần thưởng lõi

Truy vết phía app: FR-06 · FR-07 · FR-13 · FR-15 · FR-16 · US-01 kết quả mong đợi · US-02 bước 1–4 · invariants #11.

- **REQ-RESULT-01** Mạng về 0 thì trận dừng và màn kết quả "Thua" hiện: tên bản đồ, "Sống sót X / N đợt" (X = đợt đang đánh khi thua), "Còn 0 mạng", "Diệt K địch".
- **REQ-RESULT-02** Thua vẫn được lõi — X × 8 — và số lõi đó được cộng vào tiến trình đã lưu (thấy ở xưởng): thua không về không.
- **REQ-RESULT-03** Hết đợt cuối và sạch địch thì "Thắng": "Sống sót N / N đợt", số mạng còn lại; lần thắng đầu được N × 8 + 120 lõi và màn kết quả nói rõ "Thắng lần đầu — thưởng thêm 120 lõi".
- **REQ-RESULT-04** Thắng lần đầu lưu bản đồ là đã qua (kèm số mạng còn lại) và mở bản đồ kế; màn kết quả mời "Bản đồ tiếp theo", dẫn thẳng vào trận bản đồ kế.
- **REQ-RESULT-05** Chơi lại một bản đồ đã qua chỉ được floor(X × 8 × 0,35) lõi, không có thưởng lần đầu, và màn kết quả nói "Chơi lại nên lõi giảm"; thua lúc chơi lại không xoá trạng thái "đã qua" hay kỷ lục mạng cũ.
- **REQ-RESULT-06** Từ màn kết quả: "Chơi lại" vào một trận MỚI của cùng bản đồ từ đợt 1; "Chọn bản đồ" mở màn chọn bản đồ, nơi kỷ lục đợt vừa đạt đã được ghi.
- **REQ-RESULT-07** Trận không được lưu giữa chừng: tải lại trang giữa trận về màn tiêu đề, trận đó mất, và tiến trình không có lõi hay kỷ lục nào từ trận dở.
