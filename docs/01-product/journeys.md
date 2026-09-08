# Luồng người dùng

> **Trả lời:** Người dùng đi qua những luồng nào từ đầu đến cuối?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** có luồng người dùng mới · một luồng cũ đổi bản chất

<!-- CÁCH ĐIỀN
Viết bằng NGÔN NGỮ NGƯỜI DÙNG. Không có tên bảng, tên endpoint, tên component ở đây.
Mỗi luồng một mục, ID tăng dần US-01, US-02... không tái dùng số.

Mục "Điều gì có thể sai" là mục có giá trị nhất — nó là nguồn của test case và của
các trạng thái lỗi trên UI. Bỏ trống mục đó thì AI sẽ chỉ hiện thực đường đi đẹp.

KHÔNG chứa: chi tiết bố cục UI, danh mục chức năng (-> 02-requirements/scope.md).
-->

## US-01 · Lần đầu mở game và thắng bản đồ đầu tiên

**Bối cảnh:** Người chơi vừa mở link, chưa từng chơi, không có gì lưu trong máy.
Đang cầm điện thoại.

**Các bước:**
1. Màn tiêu đề hiện ra với một nút duy nhất nổi bật. Người chơi bấm nó.
2. Vào ngay bản đồ đầu tiên — không qua màn chọn bản đồ, vì chưa có gì để chọn.
3. Bản đồ hiện đường đi và những ô có thể xây. Người chơi chạm một ô trống.
4. Bảng chọn tháp hiện lên, kèm giá và một dòng mô tả tháp đang chọn.
5. Người chơi chọn một tháp. Tiền trừ đi, tháp xuất hiện trên ô đó.
6. Người chơi bấm "gọi đợt tiếp theo". Enemy đi vào từ lối vào, tháp tự bắn.
7. Enemy chết cho tiền. Người chơi xây thêm, hoặc nâng cấp tháp đã có.
8. Lặp bước 6-7 cho hết số đợt của bản đồ.
9. Đợt cuối hết enemy → màn kết quả: thắng, số đợt sống sót, số `cores` nhận được.

**Kết quả mong đợi:** Người chơi thắng bản đồ 1 mà không đọc hướng dẫn nào. Trong
máy đã lưu: bản đồ 1 đã qua, `cores` đã nhận, bản đồ 2 đã mở.

**Điều gì có thể sai:**
- Chạm vào ô mà không đủ tiền → thẻ tháp đó phải hiện rõ là không mua được **kèm
  dấu hiệu không phải màu** (icon khoá), chứ không phải im lặng không phản hồi.
- Chạm nhầm vào đúng lúc enemy đi qua đó → chạm vào ô là chọn ô, không bao giờ vô
  tình xây; xây cần một hành động thứ hai.
- Đóng tab giữa trận → trận đó **mất**, không lưu giữa trận. Mở lại về màn tiêu đề.
  Đây là hành vi cố ý, không phải lỗi (xem §Nợ kỹ thuật trong `backlog.md`).
- Xoay điện thoại giữa trận → bố cục đổi, trận **không** được phép reset.
- Máy yếu tụt xuống 20 fps → trận phải diễn ra đúng như trên máy nhanh, chỉ mượt
  kém hơn.
- Mở trong tab riêng tư, hoặc trình duyệt chặn lưu trữ → game vẫn chơi được, chỉ là
  không lưu được; phải nói cho người chơi biết, không im lặng mất tiến trình.

**Chức năng liên quan:** FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-07 · FR-14 · FR-15

---

## US-02 · Thua một bản đồ rồi thử lại

**Bối cảnh:** Người chơi đang ở bản đồ 3, mất hết mạng ở đợt 9 trên 14.

**Các bước:**
1. Mạng về 0 → trận dừng ngay, màn kết quả hiện: thua, đợt 9/14.
2. Màn kết quả vẫn cho `cores` theo số đợt đã sống sót — thua không phải về không.
3. Người chơi chọn giữa "chơi lại bản đồ này" và "về xưởng nâng cấp".
4. Chọn xưởng → thấy `cores` vừa nhận đã cộng vào, và thấy node nào giờ mua được.
5. Mua một bậc nâng cấp. `cores` trừ đi, hiệu ứng áp cho **mọi** trận sau.
6. Quay lại bản đồ 3, chơi lại. Lần này tháp mạnh hơn từ đợt 1.

**Kết quả mong đợi:** Thua vẫn tiến bộ. Người chơi hiểu được rằng cách qua bản đồ
khó không phải chỉ là chơi giỏi hơn, mà còn là nâng cấp.

**Điều gì có thể sai:**
- `cores` nhận từ chơi lại bản đồ đã thắng phải **ít hơn hẳn** lần đầu — nếu cày
  bản đồ dễ hiệu quả hơn thử bản đồ khó thì cây nâng cấp đã hỏng.
- Bấm mua nâng cấp hai lần rất nhanh → chỉ được trừ tiền một lần.
- Mua node mà điều kiện tiên quyết chưa đủ → node đó phải hiện **lý do bị khoá**,
  không chỉ hiện "khoá".
- Bản đồ vừa mở mà **không** thắng được ở mức nâng cấp tối thiểu → người chơi kẹt
  cứng, và đường ra duy nhất là cày bản đồ cũ, tức là bị phạt vì đã tiến lên. Đây
  là hỏng nghiêm trọng nhất mà thiết kế này có thể mắc; chặn bằng test tự động.

**Chức năng liên quan:** FR-08 · FR-09 · FR-10 · FR-11 · FR-12 · FR-16

---

## US-03 · Quay lại sau vài ngày

**Bối cảnh:** Người chơi đã mở 3 bản đồ, đang có 340 `cores`, mở lại link sau bốn ngày
trên cùng máy cùng trình duyệt.

**Các bước:**
1. Màn tiêu đề hiện, nút chính giờ là "chơi tiếp" và ghi rõ đang dở bản đồ nào.
2. Người chơi bấm vào màn chọn bản đồ để xem toàn cảnh: cái nào đã qua, cái nào
   khoá, khoá vì thiếu gì.
3. Chọn một bản đồ đã mở, chơi tiếp.

**Kết quả mong đợi:** Không mất gì. Không phải làm lại bước nào.

**Điều gì có thể sai:**
- Dữ liệu lưu bị hỏng, hoặc từ một phiên bản game cũ hơn → **không được xoá lặng
  lẽ**. Giữ bản hỏng lại dưới một tên khác, bắt đầu profile mới, và nói cho người
  chơi biết đã xảy ra chuyện gì.
- Người chơi đã xoá dữ liệu trình duyệt → về trạng thái người mới, đúng như US-01.
- Phiên bản game mới thêm bản đồ hoặc node nâng cấp → dữ liệu cũ vẫn phải đọc được,
  và thứ mới hiện ra như chưa mở.

**Chức năng liên quan:** FR-11 · FR-13 · FR-16

---

## US-04 · Đổi ngôn ngữ và tắt tiếng

**Bối cảnh:** Người chơi đang ở chỗ đông người, muốn tắt tiếng. Hoặc muốn chữ tiếng Anh.

**Các bước:**
1. Từ màn tiêu đề, mở cài đặt.
2. Đổi ngôn ngữ. **Toàn bộ** chữ đổi ngay, không cần tải lại trang.
3. Kéo âm lượng nhạc và âm lượng hiệu ứng về 0, hoặc tắt riêng từng cái.
4. Đóng cài đặt, chơi tiếp.
5. Lần sau mở game, ngôn ngữ và âm lượng vẫn như đã chọn.

**Kết quả mong đợi:** Hai lựa chọn này được nhớ. Không có chữ nào còn sót ngôn ngữ cũ.

**Điều gì có thể sai:**
- Chuỗi tiếng Việt dài hơn tiếng Anh khoảng 30% → đổi sang tiếng Việt không được
  làm tràn hay cắt chữ ở bất kỳ bề rộng nào.
- Trình duyệt chặn tự phát nhạc → không được coi là lỗi; nhạc chờ tới tương tác đầu
  tiên của người chơi.
- Người chơi bật "giảm chuyển động" trong hệ điều hành → chuyển động của giao diện
  tắt hết, nhưng animation của sprite giữ nguyên vì đó là nội dung game.

**Chức năng liên quan:** FR-17 · FR-18 · FR-19
