# PERFORMANCE — Test cases

Requirement: `docs/requirements/performance.md` · quyết định: `docs/decisions/performance.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-PERFORMANCE-001 — HUD đổi ở nhịp 10Hz chứ không theo frame khi trận đang chạy

- **Requirement:** REQ-PERFORMANCE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** 1440×900 → vào trận → xây Cung ô 8, 9, 3 → x3 → gọi đợt → đếm thay đổi DOM của `<header>` trong 5 giây thật
- **Mong đợi:** số bản ghi > 0 (HUD sống) và < 400
- **Automated:** `tests/e2e/performance/hud-rate.e2e.ts`

### TC-PERFORMANCE-002 — bundle JS và CSS sau gzip không vượt 900 KB

- **Requirement:** REQ-PERFORMANCE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** `pnpm build` trong `client/`, cộng gzip của `dist/assets/*.js` và `*.css`
- **Mong đợi:** tổng ≤ 921 600 byte
- **Automated:** manual — đã chặn tự động bằng bước "Cổng kích thước bundle (NFR-PERF-08)" trong `.github/workflows/ci.yml` (job `verify`); vite preview không phục vụ bản nén nên Playwright không đo được gzip
