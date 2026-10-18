# COMBAT — Loại địch và dòng tháp: tốc độ, mạng, tiền thưởng, nổ lan, làm chậm, năm dòng tháp

Truy vết phía app: FR-01 · FR-04 · FR-05 · FR-06 · FR-12 · FR-20 · FR-21 · FR-24 · FR-33 · README §Features "The game itself".

- **REQ-COMBAT-01** Dải "Đợt tới" gọi mỗi loại địch bằng tên riêng của nó: đợt đầu Đèo Gió là "10× Chạy nhanh", đợt đầu Lò Rèn Cũ là "5× Giáp".
- **REQ-COMBAT-02** Mỗi loại địch đi với tốc độ riêng: Chạy nhanh nhanh nhất (~62 đơn vị bản đồ mỗi giây), Lính (~34), Giáp chậm nhất (~26).
- **REQ-COMBAT-03** Địch lọt tới cuối đường trừ mạng theo loại: Chạy nhanh 1 mạng mỗi con, Giáp 2 mạng mỗi con.
- **REQ-COMBAT-04** Diệt địch ra vàng theo loại: Chạy nhanh 13 vàng mỗi con, Giáp 28 vàng mỗi con.
- **REQ-COMBAT-05** Đạn nổ lan (Pháo) gây sát thương cho mọi địch trong bán kính nổ: một phát có thể diệt nhiều địch cùng lúc.
- **REQ-COMBAT-06** Tháp Băng làm chậm địch: địch trúng Băng tới cuối đường muộn hơn hẳn so với không bị làm chậm, dù Băng không diệt được con nào.
- **REQ-COMBAT-07** Năm dòng tháp: ba dòng mở từ đầu (Cung, Pháo, Băng) — chưa mua mở khoá thì bảng xây chỉ có ba thẻ đó; Sét và Độc chỉ xuất hiện sau khi mở khoá ở xưởng.
- **REQ-COMBAT-08** Sét và Độc, khi đã mở, cho xem trước khi trả tiền như mọi tháp: thẻ ghi giá (Sét 260, Độc 300), chọn thẻ hiện mô tả của dòng tháp (Độc nói rõ "Xuyên giáp") và số liệu bậc 1 (Sét 22 · 58 · 1 s; Độc 16 · 74 · 0,7 s); xây thì trừ đúng giá và ô thành tháp bậc 1 của dòng đó.
- **REQ-COMBAT-09** Sét nổ lan rộng: một phát Sét diệt được nhiều địch cùng lúc, và đặt ở cùng một ô trên cùng một đợt thì Sét (bán kính nổ 44) diệt nhiều hơn hẳn một Pháo (bán kính 30).
- **REQ-COMBAT-10** Giáp giảm phẳng sát thương của mọi tháp không xuyên giáp (sát thương thực = max(1, sát thương − 6)) nhưng không làm chúng vô dụng: một Pháo một mình vẫn diệt được Giáp. Độc xuyên giáp — giáp không trừ gì vào phát bắn của nó — nên thêm một Độc cạnh Pháo đó là đủ diệt cả đợt Giáp mà Pháo một mình để lọt.
