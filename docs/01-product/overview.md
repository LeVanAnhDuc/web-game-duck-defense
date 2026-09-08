# Tổng quan sản phẩm

> **Trả lời:** Sản phẩm này là gì, cho ai, và **KHÔNG** làm gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** định vị đổi · thêm/bớt một Non-Goal · trần chi phí đổi

<!-- CÁCH ĐIỀN
File này là nơi DUY NHẤT trả lời "cái này có thuộc phạm vi không". Mọi tranh luận
về scope kết thúc ở đây.

Mục 4 (Non-Goals) là mục quan trọng nhất và là mục dễ bỏ trống nhất. Một Non-Goal
tốt là thứ nghe HỢP LÝ mà vẫn bị từ chối — "không làm chat realtime", "không hỗ trợ
nhiều tổ chức". Nếu danh sách Non-Goals trống, file này chưa làm được việc của nó.

KHÔNG chứa: danh sách tính năng (-> 02-requirements/scope.md), ngưỡng kỹ thuật
(-> 02-requirements/nfr.md), thuật ngữ (-> 01-product/glossary.md).
-->

## 1. Một câu định vị

**Phòng Tuyến** là game tower defense 2D chạy thẳng trong trình duyệt, không cần tải
và không cần đăng nhập — mở link là chơi được, trên điện thoại hay máy tính đều như
nhau, và tiến trình nằm trong máy người chơi chứ không nằm trên server nào.

## 2. Vấn đề đang giải

Game tower defense hay trên web hầu hết đòi tải app, đòi tài khoản, hoặc bám vào
Flash đã chết. Cái chạy được trên trình duyệt thì thường chỉ chơi được bằng chuột:
mở trên điện thoại là nút quá nhỏ, thông tin quan trọng nhét vào tooltip hover mà
cảm ứng không có hover.

Đây cũng là **dự án học tập**: mục tiêu thứ hai là dựng được một vòng chơi có kiến
trúc tách bạch giữa mô phỏng và hiển thị, đủ sạch để test được không cần trình duyệt.

## 3. Người dùng mục tiêu

**Nhóm chính** — người chơi giải trí ngắn, 5-15 phút một lượt, mở trên điện thoại
trong lúc chờ. Đã từng chơi tower defense nên không cần dạy lại luật, nhưng không
muốn đọc hướng dẫn dài.

**Nhóm phụ** — người chơi trên máy tính muốn tối ưu bố cục tháp, dùng phím tắt và
tốc độ x3. Nhóm này chơi lâu hơn và là nhóm cày `cores` để mở hết cây nâng cấp.

Không có nhóm thứ ba. Không có người quản trị, không có người tạo nội dung.

## 4. Non-Goals — dứt khoát không làm

- **Không có backend, không có tài khoản.** Không API, không database, không đăng
  nhập. Tiến trình sống trong `localStorage` của máy người chơi. Đổi máy là mất —
  chấp nhận, vì backend kéo theo chi phí hạ tầng, xác thực, và quyền riêng tư mà một
  game giải trí đơn không đáng chịu.
- **Không có bảng xếp hạng online.** Là hệ quả trực tiếp của điều trên. Nghe rất hợp
  lý cho một game điểm số, và vẫn bị từ chối: điểm chạy trên máy người chơi thì
  không xác thực được, nên bảng xếp hạng sẽ đầy điểm giả trong tuần đầu.
- **Không chống cheat.** `localStorage` sửa được bằng devtools trong năm giây và
  chúng ta không ngăn. Đây là game một người chơi offline; ai muốn tự phá trải nghiệm
  của mình thì cứ.
- **Không có nhiều người chơi, không có chơi theo lượt với người khác.** Không
  realtime, không mời bạn, không chia sẻ bố cục tháp.
- **Không có trình soạn bản đồ cho người chơi.** Bản đồ là dữ liệu trong repo, sửa
  bằng cách gửi PR chứ không bằng UI.
- **Không có mua trong game, không có quảng cáo, không có tiền thật.** `cores` kiếm
  bằng cách chơi, chấm hết.
- **Không có pathfinding động.** Đường đi là polyline vẽ sẵn cho mỗi bản đồ; tháp
  không bao giờ chặn đường. Loại bỏ cả một lớp thuật toán và cả một lớp lỗi.
- **Không có chế độ nền sáng.** Bảng màu trong `MASTER.md` chỉ dựng cho nền tối.
- **Không có âm thanh 3D, nhạc động theo trạng thái.** SFX rời + một bản nhạc nền
  có nút tắt.

## 5. Mô hình

| Câu hỏi | Trả lời |
| --- | --- |
| Ai trả tiền | Không ai — dự án học tập, chơi miễn phí |
| Trả bằng gì | — |
| **Trần chi phí hạ tầng / tháng** | **$0.** Static hosting (GitHub Pages). Ràng buộc này là thứ sinh ra §4 Non-Goal đầu tiên, không phải ngược lại. |

## 6. Thế nào là thành công

Đo được, không phải cảm tính:

1. **Một người chơi mới thắng được bản đồ 1 trong lần chơi đầu, không đọc hướng dẫn.**
   Nếu phải giải thích luật thì UI đã thất bại.
2. **Chơi hết 5 bản đồ mất 60-90 phút** ở mức nâng cấp trung bình. Ngắn hơn là quá
   dễ, dài hơn là đang bắt cày.
3. **Mỗi bản đồ thắng được ở mức nâng cấp thấp nhất mà người chơi có thể có lúc nó
   vừa mở** — kiểm bằng test mô phỏng headless, không bằng cảm giác. Đây là chỉ số
   quan trọng nhất, vì vi phạm nó nghĩa là người chơi bị phạt vì đã tiến lên.
