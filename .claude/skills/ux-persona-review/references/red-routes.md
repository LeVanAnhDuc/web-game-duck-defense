# Red Routes — Duck Defense

> Chốt ngày 2026-09-11. Đây là hợp đồng phạm vi: mọi lần chạy về sau đều so với file này.
> Sửa file này là mất khả năng so sánh giữa các lần chạy — chỉ sửa khi sản phẩm đổi bản chất.

**Quy ước `min_steps`:** số hành động người dùng trên đường đi tối ưu. Đoạn chơi thật
đếm bằng số thao tác tối thiểu của một người *đã biết chơi* thể loại đó.

**Quy ước `done_when`:** chỉ nói thứ nhìn thấy trên màn hình. Không nhắc tên hàm, tên
component, khoá lưu trữ — persona không được biết những thứ đó.

---

## RR-01 · Thắng bản đồ đầu tiên mà không đọc hướng dẫn

- **id:** RR-01
- **name:** Thắng bản đồ đầu tiên mà không đọc hướng dẫn
- **actor:** người chơi mới, chưa có gì lưu trong máy, đang cầm điện thoại
- **entry:** `https://levananhduc.github.io/web-game-duck-defense/`
- **done_when:** màn kết quả hiện chữ **thắng**, kèm số đợt đã qua và số `cores` nhận
  được; sau khi đóng nó thì bản đồ 2 đã mở khoá trên màn chọn bản đồ
- **min_steps:** 6 — 1 bấm nút chính · 1 chạm ô trống · 1 chọn tháp · 1 gọi đợt · 1 xây
  thêm tháp · 1 gọi đợt tới hết bản đồ
- **why_red:** người chơi phải tự hiểu luật tower defense qua giao diện. Không thắng
  nổi bản đồ 1 thì không có bản đồ 2, và cả cây nâng cấp trở thành vô nghĩa
- **status:** live
- **derived_from:** docs/01-product/journeys.md:18 (US-01) · README.md:17 §Features

## RR-02 · Thua, mua một bậc nâng cấp, rồi thắng lại

- **id:** RR-02
- **name:** Thua, mua một bậc nâng cấp, rồi thắng lại
- **actor:** người chơi đang mắc ở một bản đồ khó
- **entry:** `https://levananhduc.github.io/web-game-duck-defense/`
- **done_when:** người chơi mua được một node trong cây nâng cấp (số `cores` giảm đúng
  bằng giá), rồi quay lại đúng bản đồ vừa thua và bắt đầu trận mới
- **min_steps:** 5 — thua trận · chọn "về xưởng" · chọn node · xác nhận mua · chọn lại
  bản đồ đó
- **why_red:** đây là vòng lặp tiến bộ của sản phẩm. Nếu người chơi không nối được
  "thua → mạnh hơn → thắng" thì thua chỉ còn là thất bại
- **status:** live
- **derived_from:** docs/01-product/journeys.md:54 (US-02) · README.md:17 §Features
  "Progress that respects your time"

## RR-03 · Quay lại sau vài ngày và chơi tiếp

- **id:** RR-03
- **name:** Quay lại sau vài ngày và chơi tiếp
- **actor:** người đã mở vài bản đồ, mở lại link trên cùng máy
- **entry:** `https://levananhduc.github.io/web-game-duck-defense/` (sau khi đã thắng ít nhất một bản đồ rồi tải lại)
- **done_when:** màn tiêu đề nói rõ **đang dở bản đồ nào**, và màn chọn bản đồ hiện
  đúng cái nào đã qua, cái nào còn khoá, khoá vì thiếu gì
- **min_steps:** 2 — mở màn chọn bản đồ · vào một bản đồ đã mở
- **why_red:** tiến độ chỉ nằm trong trình duyệt này. Người chơi phải tin là nó còn
  đó, nếu không họ sẽ không quay lại lần thứ ba
- **status:** live
- **derived_from:** docs/01-product/journeys.md:83 (US-03)

## RR-04 · Tắt tiếng và đổi sang tiếng Anh giữa chừng

- **id:** RR-04
- **name:** Tắt tiếng và đổi sang tiếng Anh giữa chừng
- **actor:** người đang ở chỗ đông người
- **entry:** `https://levananhduc.github.io/web-game-duck-defense/`
- **done_when:** **mọi** chữ trên màn hình đổi sang ngôn ngữ mới mà trang không tải
  lại, và âm lượng về 0; tải lại trang thì hai lựa chọn đó vẫn còn
- **min_steps:** 4 — mở cài đặt · đổi ngôn ngữ · kéo âm lượng về 0 · đóng
- **why_red:** "không có chữ nào còn sót ngôn ngữ cũ" là loại lỗi mà test tự động hay
  bỏ qua và người dùng thấy ngay
- **status:** live
- **derived_from:** docs/01-product/journeys.md:108 (US-04)

## RR-05 · Đánh một trận chỉ bằng bàn phím

- **id:** RR-05
- **name:** Đánh một trận chỉ bằng bàn phím
- **actor:** người không dùng chuột, không dùng cảm ứng
- **entry:** `https://levananhduc.github.io/web-game-duck-defense/`
- **done_when:** xây được ít nhất một tháp và gọi được một đợt **mà không chạm chuột
  lần nào**, với vòng focus luôn nhìn thấy được ở mọi bước
- **min_steps:** 5 — Tab tới nút chơi · Enter · Tab tới một ô trống · Enter chọn tháp ·
  Enter gọi đợt
- **why_red:** README hứa thẳng "every battle action is reachable by keyboard". Một
  lời hứa a11y sai là lỗi nặng hơn một lời hứa thiếu
- **status:** live
- **derived_from:** README.md:39 §Features · docs/01-product/journeys.md:18

---

## Đã loại khỏi mọi lượt chạy

| Route | Vì sao loại |
| --- | --- |
| Đo fps ở đợt cuối bản đồ 5 trên điện thoại tầm trung | phép đo, không phải hành trình; cần thiết bị thật |
| Kiểm bằng screen reader thật | persona chạy trong trình duyệt, không nghe được đầu ra của screen reader |
| Cân bằng 5 bản đồ bằng cách chơi tay hết 30 phút | vượt trần 40 hành động một phiên; đây là việc của người thật |
