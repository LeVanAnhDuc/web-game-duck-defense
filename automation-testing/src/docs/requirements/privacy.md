# PRIVACY — Game không thu thập gì

Truy vết phía app: NFR-DATA-01 · NFR-DATA-04 · NFR-SEC-02 · `docs/01-product/overview.md` (không backend) · README "nothing is ever sent anywhere".

- **REQ-PRIVACY-01** Chơi game (cờ đăng nhập tắt) không gửi request nào ra ngoài origin của app, ngoài Google Fonts: không analytics, không telemetry.
- **REQ-PRIVACY-02** Game không đặt cookie nào.
- **REQ-PRIVACY-03** Sau khi chơi và đổi cài đặt, `localStorage` chỉ có đúng một khoá `duckdefense.profile` và `sessionStorage` trống; profile chỉ chứa các trường tiến trình (`schemaVersion`, `locale`, `cores`, `upgrades`, `maps`, `settings`, `lastMap`) — không tên, không email, không định danh thiết bị hay ID ngẫu nhiên.
