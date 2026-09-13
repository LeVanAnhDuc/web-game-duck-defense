# Yêu cầu phi chức năng

> **Trả lời:** Ngưỡng nào áp cho **mọi** feature, để không phải nhắc lại từng lần?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** thêm loại tài nguyên mới · thêm nhóm người dùng · sau sự cố sinh ra ngưỡng mới

<!-- CÁCH ĐIỀN
Đây là file AI BỎ QUA ÂM THẦM nếu nó trống — code vẫn chạy, test vẫn xanh, và
không có cảnh báo nào. Vì vậy nó được điền sẵn bằng các ngưỡng mặc định hợp lý.

VIỆC CỦA BẠN: đọc một lượt, XOÁ dòng không áp dụng, SỬA con số cho khớp dự án,
rồi đổi trạng thái sang 🟢. Giữ nguyên nguyên văn mặc định cũng được, nhưng phải
là lựa chọn có ý thức.

Mỗi dòng phải ĐO ĐƯỢC. Không viết được cách kiểm thì chưa phải yêu cầu:
  Sai:  "API phải nhanh"      Đúng: "p95 < 300ms cho endpoint đọc"
  Sai:  "phải bảo mật"        Đúng: "mọi mutation kiểm quyền ở server"

ID không tái dùng. Bỏ một ngưỡng thì đổi thành ~~(bỏ)~~, không xoá dòng.
Tài liệu thiết kế của feature tham chiếu ID ở dòng `Liên quan:` — KHÔNG chép nội dung sang.
-->

**Đã rà theo dự án 2026-09-08.** Dự án này **không có server và không có database**
(xem `01-product/overview.md` §4), nên phần lớn ngưỡng mặc định về endpoint, quyền và
truy vấn bị bỏ. Chúng được giữ lại dưới dạng `~~(bỏ)~~` để ID không bị tái dùng.

## Performance

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| ~~NFR-PERF-01~~ | ~~Mọi endpoint trả danh sách đều phân trang~~ **(bỏ — không có endpoint)** | — |
| ~~NFR-PERF-02~~ | ~~p95 < 300ms cho endpoint đọc~~ **(bỏ — không có endpoint)** | — |
| ~~NFR-PERF-03~~ | ~~Không có truy vấn N+1~~ **(bỏ — không có truy vấn)** | — |
| ~~NFR-PERF-04~~ | ~~Mọi cột filter/sort đều có index~~ **(bỏ — không có bảng)** | — |
| NFR-PERF-05 | **60 fps** ở tốc độ x1 với 60 enemy và 20 tháp trên bản đồ, trên máy tính; **≥ 30 fps** trên điện thoại tầm trung | đo bằng bộ đếm frame trong dev overlay, ở bản đồ nặng nhất, đợt cuối |
| NFR-PERF-06 | Mô phỏng chạy **fixed timestep 60Hz**, tách hoàn toàn khỏi tốc độ vẽ. Tụt frame **không** được làm kết quả trận đổi | test: chạy cùng seed với dt vẽ khác nhau, so state cuối |
| NFR-PERF-07 | React **không** re-render theo frame. HUD đọc snapshot ở **≤ 10Hz** | đếm số lần render trong 5 giây, phải ≤ 50 |
| NFR-PERF-08 | Bundle JS đầu tiên **≤ 900 KB gzip**, tổng asset trước khi vào được màn tiêu đề **≤ 1,5 MB** | `vite build` + báo cáo kích thước, chạy trong CI |
| NFR-PERF-09 | Từ lúc mở link tới lúc màn tiêu đề bấm được: **≤ 3 giây** trên 4G mô phỏng | Lighthouse, throttle Slow 4G |
| NFR-PERF-10 | Một trận đầy đủ chạy headless xong trong **< 200ms** | test có đo thời gian |

## Security

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| ~~NFR-SEC-01~~ | ~~Mọi mutation kiểm quyền ở server~~ **(bỏ — không có server; xem Non-Goal "không chống cheat")** | — |
| NFR-SEC-02 | Không log dữ liệu người chơi. Log chỉ có thông tin kỹ thuật | review format log |
| ~~NFR-SEC-03~~ | ~~Rate limit endpoint đăng nhập~~ **(bỏ — không có đăng nhập)** | — |
| NFR-SEC-04 | Không có secret nào trong repo hay trong bundle. Dự án này **không cần secret nào** | grep + review |
| NFR-SEC-05 | Dependency không có lỗ hổng mức high trở lên | `pnpm audit --audit-level=high` trong CI |
| ~~NFR-SEC-06~~ | ~~Lỗi trả về không chứa stack trace~~ **(bỏ — không có phản hồi server)** | — |
| NFR-SEC-07 | Dữ liệu đọc từ `localStorage` được coi là **không đáng tin**: kiểm kiểu trước khi dùng, không bao giờ `eval`, không bao giờ dựng DOM từ nó | test với profile bị sửa tay |

## Accessibility

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-A11Y-01 | Tương phản chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1. **Đo bằng script, không ước lượng** | ma trận đo trong `design-system/tower-defense/MASTER.md` §1.1b |
| NFR-A11Y-02 | Mọi hành động thao tác được bằng bàn phím, và focus luôn thấy được — **kể cả đặt tháp** | thử tay, đi hết một trận chỉ bằng bàn phím |
| NFR-A11Y-03 | Vùng bấm ≥ 44×44px trên thiết bị cảm ứng | review mockup + đo trên app đang chạy |
| ~~NFR-A11Y-04~~ | ~~Mọi input có label liên kết~~ **(giữ, thu hẹp)** → chỉ áp cho thanh trượt âm lượng và ô chọn ngôn ngữ trong màn cài đặt | review |
| NFR-A11Y-05 | Tôn trọng `prefers-reduced-motion`: **tắt hết chuyển động của giao diện**, giảm hiệu ứng hạt trong canvas, **giữ** animation sprite | review CSS + thử tay |
| NFR-A11Y-06 | **Không trạng thái nào chỉ phân biệt được bằng màu.** Mỗi trạng thái phải có kênh thứ hai: icon, chữ, hình dạng, hoặc nét chữ | review từng trạng thái |
| NFR-A11Y-07 | Canvas có nhãn văn bản thay thế mô tả tình hình trận (mạng, tiền, đợt) cho screen reader; HUD là DOM thật nên tự đọc được | thử với screen reader |

## i18n

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-I18N-01 | Không hardcode chuỗi hiển thị trong code. Mọi chuỗi đi qua từ điển vi/en | grep tìm chuỗi tiếng Việt/Anh trong `.tsx` ngoài `i18n/` |
| ~~NFR-I18N-02~~ | ~~Thời gian lưu ở UTC~~ **(bỏ — game không hiện thời gian nào)** | — |
| NFR-I18N-03 | Số hiển thị theo locale người chơi (dấu phân cách thập phân) | review |
| NFR-I18N-04 | Bố cục không tràn, không cắt chữ ở **cả hai locale**, ở mọi bề rộng. Từng nhãn lệch nhau tới ~2 lần theo cả hai chiều; **không** locale nào là "bản dài" — đo được ở `tests/core/i18n.test.ts` | e2e chạy cả `vi` và `en`, không chỉ một |

## Reliability

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| ~~NFR-REL-01~~ | ~~Mọi lệnh gọi ra ngoài có timeout~~ **(bỏ — không gọi ra ngoài, trừ Google Fonts qua `<link>`)** | — |
| ~~NFR-REL-02~~ | ~~Tác vụ ghi quan trọng là idempotent~~ **(giữ, đổi nghĩa)** → mua nâng cấp hai lần liên tiếp chỉ trừ tiền một lần | test |
| NFR-REL-03 | Không có trạng thái loading vô hạn: nạp asset thất bại phải hiện lỗi và cho thử lại | thử tay với network offline |
| NFR-REL-04 | Đọc profile **không bao giờ throw**. Bản hỏng hoặc sai `schemaVersion` thì giữ lại dưới key khác và bắt đầu profile mới, có thông báo | test với 6 dạng dữ liệu rác |
| NFR-REL-05 | Ghi profile thất bại (hết quota, tab riêng tư, trình duyệt chặn) thì game **vẫn chơi được** và người chơi được cho biết là không lưu được | test với `localStorage` bị chặn |

## Data & Privacy

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-DATA-01 | Trường nào là PII được liệt kê rõ ở bảng dưới | bảng dưới |
| ~~NFR-DATA-02~~ | ~~Xoá tài khoản thì xoá toàn bộ PII~~ **(bỏ — không có tài khoản)** | — |
| ~~NFR-DATA-03~~ | ~~Có đường khôi phục dữ liệu: backup~~ **(bỏ — dữ liệu nằm trong máy người chơi, không có backup)** | — |
| NFR-DATA-04 | Game **không thu thập gì**: không analytics, không telemetry, không cookie, không gọi mạng nào ngoài asset tĩnh và Google Fonts | kiểm tab Network sau khi chơi một trận đầy đủ |
| NFR-DATA-05 | `schemaVersion` có mặt trong profile **từ phiên bản đầu tiên**, kể cả khi chưa có gì để migrate | review code ghi profile |

**Trường PII trong dự án này:**

| Trường | Nằm ở | Giữ bao lâu |
| --- | --- | --- |
| _(không có)_ | — | — |

Không có trường PII nào. Profile chỉ chứa tiến trình chơi: `cores`, bậc nâng cấp,
kết quả từng bản đồ, ngôn ngữ, âm lượng. Không có tên, không có email, không có
định danh thiết bị, không có ID sinh ngẫu nhiên nào để theo dấu.
