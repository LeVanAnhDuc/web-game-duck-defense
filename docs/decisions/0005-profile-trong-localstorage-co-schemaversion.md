# ADR-0005 · Một profile trong localStorage, một key, có schemaVersion từ ngày đầu

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** FR-11 · FR-13 · FR-16 · FR-25 · NFR-REL-04 · NFR-REL-05 · NFR-SEC-07 · NFR-DATA-04 · NFR-DATA-05

## 1. Bối cảnh

`overview.md` §4 đã chốt: không backend, không tài khoản, trần chi phí $0. Nhưng
meta-progression bắt buộc phải lưu — `cores`, bậc nâng cấp, tháp đã mở, kết quả từng
bản đồ, ngôn ngữ, âm lượng. Nếu không lưu được thì cả nhánh tiến trình vô nghĩa.

## 2. Quyết định

**Một object duy nhất, dưới một key duy nhất** trong `localStorage`, mang
`schemaVersion` **từ phiên bản đầu tiên** — kể cả khi chưa có gì để migrate.

Đọc là **phòng vệ và không bao giờ throw**. Parse lỗi, thiếu trường, kiểu sai, hoặc
`schemaVersion` lạ → **không xoá**, mà đổi tên key hiện tại thành
`profile.corrupt.<timestamp>`, bắt đầu profile mới, và **nói cho người chơi biết**.

Ghi chỉ xảy ra khi trận kết thúc hoặc người chơi đổi cài đặt — không ghi theo tick.
Ghi thất bại (hết quota, tab riêng tư, trình duyệt chặn) thì game **vẫn chơi được**,
chỉ là không lưu, và người chơi được cho biết.

Không lưu gì suy ra được: **bản đồ nào đang mở là hàm** của kết quả bản đồ + bậc nâng
cấp, không phải một trường riêng.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Nhiều key (`cores`, `upgrades`, `maps`...) | Không có ghi nguyên tử: tab đóng giữa hai lệnh ghi để lại profile nửa vời. Một key thì hoặc ghi cả, hoặc không ghi gì |
| IndexedDB | API bất đồng bộ cho một object vài KB. Đổi lấy độ phức tạp mà không được gì; quota của `localStorage` (~5MB) hơn nhu cầu vài trăm lần |
| Thêm `schemaVersion` khi nào cần migrate lần đầu | Lúc đó bản lưu cũ **không có** trường đó, và không phân biệt được "profile v1" với dữ liệu rác. Trường vô dụng ở phiên bản 1 là trường cứu mạng ở phiên bản 2 |
| Xoá profile khi đọc lỗi | Người chơi mất tiến trình **và** không biết vì sao. Giữ lại bản hỏng thì còn cứu được, và ít nhất còn giải thích được |
| Ký hoặc mã hoá profile để chống sửa | `overview.md` §4 đã từ chối chống cheat. Khoá nằm trong bundle nên chống được đúng năm phút, và chỉ làm khổ người viết code |
| Lưu thêm state giữa trận để chơi tiếp sau khi đóng tab | Phải serialize toàn bộ state mô phỏng, và nó đổi mỗi lần sửa `core/` — tức là mỗi phiên bản lại phải migrate một schema lớn. Ghi vào `backlog.md` §Nợ kỹ thuật thay vì làm ngay |
| Trường `unlockedMaps` lưu tường minh | Hai nguồn sự thật cho cùng một câu hỏi. Chúng sẽ lệch nhau, và lệch âm thầm |

## 4. Hệ quả

**Được:**
- Chi phí hạ tầng đúng $0, deploy là copy file tĩnh.
- Không thu thập gì, nên không có nghĩa vụ về quyền riêng tư (NFR-DATA-04).
- Profile hỏng không bao giờ làm trắng màn hình.

**Mất / phải chấp nhận:**
- **Đổi máy hoặc đổi trình duyệt là mất tiến trình.** Xoá dữ liệu trình duyệt cũng
  vậy. Đây là cái giá trực tiếp của trần $0.
- Không có bảng xếp hạng, không có đồng bộ nhiều thiết bị — đã là Non-Goal.
- Đóng tab giữa trận là mất trận đó.
- Mỗi phiên bản thêm trường vào profile phải viết một hàm migrate và một test đọc
  được profile của phiên bản trước.

**Điều kiện xem lại quyết định này:** dự án chấp nhận có backend (lúc đó Non-Goal
đầu tiên trong `overview.md` §4 phải đổi trước, và ADR này bị thay thế) · hoặc profile
lớn tới mức vượt quota `localStorage`.
