# PROFILE — Tiến trình lưu trong máy: một khoá, đọc phòng vệ, không bao giờ xoá

Truy vết phía app: FR-11 · FR-25 · NFR-REL-04 · NFR-REL-05 · NFR-SEC-07 · NFR-DATA-05 · US-01/US-03 "Điều gì có thể sai" · ADR-0005 · invariants #10.

- **REQ-PROFILE-01** Tiến trình nằm trong máy dưới MỘT khoá `duckdefense.profile`, mang `schemaVersion: 1`; đổi một cài đặt là ghi ngay khoá đó.
- **REQ-PROFILE-02** Dữ liệu lưu không đọc được (JSON vỡ) không làm game hỏng: game bắt đầu tiến trình mới, GIỮ bản cũ nguyên văn dưới khoá `duckdefense.profile.corrupt.<thời điểm>` (không xoá), và nói cho người chơi biết bằng một dải thông báo.
- **REQ-PROFILE-03** Profile có `schemaVersion` khác 1 được đối xử như bản không đọc được: giữ lại, thông báo, bắt đầu mới.
- **REQ-PROFILE-04** Profile đọc được nhưng có trường sai (sai kiểu, ngoài khoảng, nâng cấp hay bản đồ của một phiên bản khác) thì chỉ trường đó về mặc định, phần còn lại GIỮ nguyên, và người chơi vẫn được thông báo.
- **REQ-PROFILE-05** Trình duyệt chặn lưu trữ thì game vẫn chơi được (vào trận, xây tháp) và hiện dải thông báo rằng tiến trình sẽ KHÔNG được giữ lại.
- **REQ-PROFILE-06** Chuỗi lạ trong profile (thẻ HTML, mã script) không bao giờ được dựng thành HTML hay chạy như mã: không thực thi, không hiện ra.
- **REQ-PROFILE-07** Đóng dải thông báo thì nó biến mất ngay; bản cũ đã giữ lại vẫn còn.
