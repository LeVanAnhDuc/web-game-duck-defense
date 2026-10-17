# DUCKERID — Đăng nhập Ducker ID tuỳ chọn sau cờ tính năng

Truy vết phía app: FR-37 · US-05 · ADR-0010 · NFR-DATA-04 · NFR-A11Y-03 · invariants #14.

- **REQ-DUCKERID-01** Cờ tắt (bản build mặc định và bản Pages): không có nút đăng nhập hay nút tài khoản, không có request nào ra ngoài origin của app (trừ Google Fonts), và không có `ducker.pkce` trong sessionStorage.
- **REQ-DUCKERID-02** Cờ tắt thì module đăng nhập không đụng tới URL: `?code=…&state=…` lạ được giữ nguyên.
- **REQ-DUCKERID-03** Cờ bật: nút "Đăng nhập" nằm cạnh công tắc ngôn ngữ; bấm → qua Ducker ID → quay về màn tiêu đề với nút "Tài khoản Ducker ID"; URL sạch (không còn `code` / `state`); không có lỗi console.
- **REQ-DUCKERID-04** Menu tài khoản hiện tên người dùng, "Mở hồ sơ Ducker ID" trỏ tới trang hồ sơ trên issuer, và "Đăng xuất"; Esc đóng menu và trả focus về nút tài khoản; "Đăng xuất" về nút "Đăng nhập" và đặt focus vào nó.
- **REQ-DUCKERID-05** Phiên không được lưu: tải lại trang khi đang đăng nhập thì về chưa đăng nhập.
- **REQ-DUCKERID-06** `state` bị sửa, hoặc Ducker ID trả lỗi, thì về chưa đăng nhập, URL sạch, không có gì chặn đường.
- **REQ-DUCKERID-07** Đã đăng nhập thì game vẫn chơi được như thường.
- **REQ-DUCKERID-08** Ở tiếng Anh các nhãn là "Sign in", "Ducker ID account", "Open Ducker ID profile", "Sign out".
- **REQ-DUCKERID-09** Ở 320px và 375px, cả hai ngôn ngữ: nút đăng nhập ≥ 44×44 và không đè công tắc ngôn ngữ, thanh trên không xuống dòng khi đổi sang nút tài khoản, công tắc ngôn ngữ giữ ≥ 44px, và menu tài khoản nằm trọn trong màn hình.
