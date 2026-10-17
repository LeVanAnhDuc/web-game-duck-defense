# WAVE — Đợt địch: gọi đợt, tiến độ, tiền thưởng, mạng, tốc độ, tạm dừng

Truy vết phía app: FR-02 · FR-03 · FR-05 · FR-06 · FR-10 · FR-22 · FR-24 · NFR-PERF-06 · US-01 bước 6–8 · invariants #4.

- **REQ-WAVE-01** Trước đợt đầu: nhãn "Đợt 1 / 12", thanh tiến độ ở 0 (không phải 1), dải "Đợt tới" liệt kê thành phần đợt sắp tới theo loại ("5× Lính"), và nút "GỌI ĐỢT TIẾP THEO" bấm được.
- **REQ-WAVE-02** Gọi đợt thì nút gọi đợt tắt trong suốt đợt — bằng `aria-disabled`, vẫn ở trong tab order — và bấm thêm không gọi chồng đợt.
- **REQ-WAVE-03** Đợt hết địch thì thanh tiến độ tăng 1, nhãn sang "Đợt 2 / 12", dải "Đợt tới" sang đợt kế ("8× Lính"), và nút gọi đợt bấm lại được.
- **REQ-WAVE-04** Tháp diệt địch thì vàng tăng đúng tiền thưởng của loại địch đó (Lính 11 vàng).
- **REQ-WAVE-05** Địch đi tới cuối đường thì trừ mạng (Lính 1 mạng mỗi con).
- **REQ-WAVE-06** Tốc độ trận x1 / x2 / x3, mặc định x1, đổi được bất cứ lúc nào; tốc độ không đổi kết quả — cùng một đợt chạy ở x1 và ở x3 ra cùng số mạng mất.
- **REQ-WAVE-07** Tạm dừng: nút đổi thành "Tiếp tục" (`aria-pressed`), trận đứng yên — địch không tiến, mạng, vàng, tiến độ không đổi dù thời gian trôi; bấm "Tiếp tục" thì trận chạy lại từ chỗ đã dừng.
