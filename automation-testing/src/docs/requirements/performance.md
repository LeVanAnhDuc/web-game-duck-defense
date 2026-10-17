# PERFORMANCE — HUD không theo frame, bundle trong ngân sách

Truy vết phía app: NFR-PERF-07 · NFR-PERF-08 · invariants #7.

- **REQ-PERFORMANCE-01** Khi trận đang chạy (tháp bắn, địch chết ra tiền), HUD không cập nhật theo từng frame: trong 5 giây thanh HUD thay đổi ở mức tương ứng ≤ 10 lần/giây — nhưng vẫn thay đổi (HUD không đứng im).
- **REQ-PERFORMANCE-02** Tổng JS + CSS của bản build, nén gzip, không vượt 900 KB.
