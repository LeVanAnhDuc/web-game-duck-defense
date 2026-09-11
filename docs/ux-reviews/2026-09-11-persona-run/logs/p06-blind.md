# p06 Duy · Phiên mù — không có mục tiêu (negative persona)

- **Thiết bị:** desktop 1440×900 · **Cache:** nóng · **rAF:** 62fps · **localStorage:** xoá sạch
- **Công cụ:** playwright · **Kết quả:** thua bản đồ 1 ở đợt 3/12, **diệt 0 địch**, rồi dừng ở gần trần 40 hành động
- **Cách đọc phiên này:** Duy là phép thử ngược. README nói *"Every map is winnable with no
  upgrades at all, and a test enforces it"* — nếu anh ấy bỏ đi sớm vì "dễ quá" thì đó là
  **đúng thiết kế**. Chuyện đã xảy ra lại là ngược lại: anh ấy thua sạch ván đầu.

---

**1. Ấn tượng 5 giây** (ghi ngay lúc vừa mở, chưa sửa lại)

- Đây là trang gì, làm được gì cho tôi? → Một game tower defense tên "Duck Defense", tôi đoán nó cho tôi chơi giữ đường không cho quái đi qua — đúng y như cái tên game nói, không có gì bí ẩn.
- Trang dành cho người như tôi hay ai khác? → Nhìn giao diện tối giản (nút CHƠI to, hai nút phụ), tôi nghĩ nó dành cho người chơi giải trí nhẹ nhàng hơn là dân "hardcore" như tôi — chưa thấy dấu hiệu gì của độ sâu (không thấy chữ "khó", "endless", "achievement" ngay từ đầu).
- Có tin để nhập email/sđt không? → Không cần nghĩ vì trang không hỏi gì cả, không có đăng ký. Cảm giác an toàn kiểu "chơi xong đóng tab" thôi.
- Ba từ: đơn giản, tò mò, hoài nghi (nghi ngờ liệu có đủ chiều sâu).

**2. Chuyện đã xảy ra**

- Tôi thấy màn hình chính: tiêu đề "Duck Defense", câu "Giữ đường. Đừng để chúng đi qua.", nút CHƠI, hai nút "Chọn bản đồ" và "Xưởng nâng cấp", cuối trang có "Đã mở 1/5 bản đồ" và "0 Lõi".
- Tôi tưởng "Lõi" là tiền tệ để mở khoá vĩnh viễn kiểu meta-progression (giống Bloons TD). Tôi vào "Xưởng nâng cấp" trước để đọc bảng — đúng thói quen của tôi, đọc số liệu trước khi đặt bất kỳ cái gì.
- Xưởng nâng cấp có 4 nhóm: Kinh tế, Sát thương, Tiện ích, Mở khoá — mỗi nhánh có % rõ ràng ("+4% sát thương tháp Cung", "-5% giá xây tháp"...), và có nhánh khoá cần điều kiện tiên quyết (ví dụ "Lãi cuối đợt" cần "Tiền rơi bậc 2"). Trong đầu tôi nghĩ: "Ồ, cái này có cây kỹ năng thật, không phải chỉ mua cho vui." Đúng cái tôi đang tìm.
- Quay lại, bấm "Chọn bản đồ": 5 bản đồ, chỉ bản đồ 1 "Đồng Cỏ" mở, 4 bản đồ sau khoá tuần tự theo kiểu "phải qua bản trước". Không thấy nút chọn độ khó (dễ/thường/khó/ác mộng) ở đây — tôi nghĩ "chắc độ khó nằm trong lúc chơi hoặc không có, để xem".
- Bấm vào "Đồng Cỏ", vào thẳng trận: 12 đợt, 20 mạng, 260 vàng, 10 ô đặt tháp, 3 loại tháp (Cung 60, Pháo 110, Băng 90). Rê chuột vào tháp Cung chỉ thấy mô tả một dòng "Bắn nhanh, một mục tiêu" — không có bảng DPS/tầm bắn/pierce như tôi kỳ vọng trước khi đặt. Trong đầu: "Không có số liệu trước khi mua, phải đặt xuống mới biết."
- Đặt tháp Cung ở ô số 5 (60 vàng): lúc này panel hiện "Cung Bậc 1/3, Sát thương 12 → 18, Nâng 60, Bán +30". Có thêm chi tiết hơn nhưng vẫn chỉ có sát thương, không có tốc độ bắn hay tầm bắn bằng số.
- Bấm "Gọi đợt tiếp theo", đợt 1 tự chạy. Sau ~15s: đợt tăng lên 2/12, mạng giảm 20→15 (mất 5 mạng), nhưng **vàng vẫn y nguyên 200** — tức tháp của tôi không giết được con nào. Tôi nghĩ: "chắc đặt sai vị trí, ô số 5 không nằm cạnh đường đi."
- Gọi tiếp đợt 2, đặt thêm một tháp Cung ở ô số 6 để thử. Đợi thêm, mạng tụt tiếp 15→7, vàng vẫn 200 nguyên xi. Gọi đợt 3, chờ thêm 15s → màn hình chuyển sang "Thua". Kết quả: "Sống sót 3/12 đợt, Còn 0 mạng, **Diệt 0 địch**, Lõi +24".
- Nghĩ trong đầu lúc đó: "Cả trận chết không giết nổi một con nào — hai khả năng: một là tôi chọn ô đặt tháp toàn nằm ngoài tầm với của đường đi (lỗi của tôi vì không nhìn kỹ bản đồ vẽ trên canvas), hai là có bug tháp không bắn. Tôi nghiêng về khả năng một vì HUD (mạng, đợt) vẫn chạy đúng nhịp, chứng tỏ vòng lặp game hoạt động bình thường."
- Vào lại "Xưởng nâng cấp" với 24 Lõi vừa kiếm được — nhưng mọi nút nâng cấp đều bị khoá xám (disabled) vì rẻ nhất cũng cần 60 Lõi. Nghĩ: "Được, kiểu cày game — thua một trận vẫn được thưởng chút ít, nhưng chưa đủ mua gì, phải chơi lại."

**3. Con số**

- Số hành động: khoảng 38-40 lượt thao tác (điều hướng, bấm, rê chuột, chờ, chụp ảnh, đọc snapshot).
- Thời gian: ước chừng 4-5 phút thực tế (phần lớn là các lần chờ 15-20 giây để xem đợt quái chạy).
- Số lần quay lui: 2 lần (bấm "Quay lại" từ Xưởng nâng cấp về màn chính, và từ trận về màn chính gián tiếp qua màn Thua).
- Số lần bấm vào chỗ không phản hồi rõ ràng: 1 lần (bấm "Xưởng nâng cấp" bằng tên text thay vì ref, báo lỗi không khớp phần tử — do tool của tôi, không phải lỗi trang).
- Kết quả: **bỏ cuộc sau khi thua ván đầu** — dừng ở màn "Thua" (Sống sót 3/12 đợt, diệt 0 địch) vì đã chạm giới hạn số bước tôi tự cho phép để khám phá, không chơi lại lần hai để gỡ vị trí đặt tháp.

**4. Ba từ sau khi dùng**

Ba từ: **tò mò, hụt hẫng, muốn-thử-lại**. Có quay lại không? Có — vì hệ thống nâng cấp vĩnh viễn (Lõi + cây kỹ năng có nhánh khoá) đúng là thứ tôi tìm ("một cây nâng cấp có đánh đổi thật"), tôi muốn cày thêm để mở khoá "Tháp Sét" và "Tháp Độc". Nhưng lần đầu chơi tôi thua sml mà không giết nổi con nào, nên cảm giác vui ban đầu (tò mò) đã pha thêm hụt hẫng — không rõ là do tôi ngu hay do game khó vô lý, muốn quay lại chủ yếu để tự trả lời câu đó chứ chưa hẳn vì mê game.

So với ba từ lúc mới mở (đơn giản, tò mò, hoài nghi): cảm giác đơn giản đã biến mất — hoá ra không đơn giản, thua ngay ván đầu không hiểu vì sao. Tò mò thì vẫn giữ nguyên, thậm chí tăng (tò mò kiểu "để xem chỗ nào tôi sai"). Hoài nghi ban đầu về "có đủ sâu không" đã được giải toả một phần nhờ cây nâng cấp ở Xưởng, nhưng lại sinh ra hoài nghi mới về việc trải nghiệm đặt tháp (không có số liệu trước khi mua, không rõ vì sao tháp không bắn được).

**5. Đính kèm thô**

`p06-01-moi-mo.png`, `p06-02-xuong-nang-cap.png`, `p06-03-chon-ban-do.png`, `p06-04-trong-game.png`,
`p06-05-hover-cung.png`, `p06-06-thap-da-dat.png`, `p06-07-dot-1-dang-choi.png`, `p06-08-dot-1-tiep.png`,
`p06-09-check-canvas.png`, `p06-10-dot-2.png`, `p06-11-thua-cuoc.png` (ảnh cuối — màn hình "Thua").

Log console (dán nguyên trạng, không bình luận):
```
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
```
