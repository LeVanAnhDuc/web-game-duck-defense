# LOADING — Nạp dữ liệu trận thất bại: báo lỗi, thử lại, không treo

Truy vết phía app: NFR-REL-03 · `docs/specs/tower-defense-v1/design.md` §5.

- **REQ-LOADING-01** Nạp dữ liệu game (sprite sheet của trận) thất bại thì không có màn chờ vô hạn: một lớp báo lỗi (`alert`) hiện "Không tải được dữ liệu game." kèm tên file hỏng, nút "Thử lại" và nút "Quay lại".
- **REQ-LOADING-02** "Thử lại" khi mạng đã ổn thì thật sự khởi động lại trận: lớp lỗi biến mất, HUD và các ô xây hiện ra.
- **REQ-LOADING-03** "Quay lại" từ lớp lỗi rời trận về màn chọn bản đồ.
