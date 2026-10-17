# Nguồn requirement của Duck Defense

**Requirement của module lấy ở đâu.** `/write-tests` đọc file này ở bước 1 và chỉ đọc các nơi liệt kê dưới đây, cộng với
những gì user nói trong chat. Không dùng Jira/Confluence.

Đường dẫn tính từ thư mục gốc repo test. Danh sách này được user xác nhận lúc scaffold; khi user chỉ thêm nơi khác, hoặc
một nơi bị bỏ/đóng băng, sửa bảng này trong cùng lượt.

## Tài liệu

- `../docs/README.md` — bản đồ tài liệu + quy ước ID (US / FR / NFR / ADR); đọc trước để biết file nào là nguồn đúng
- `../docs/01-product/overview.md` — định vị, Non-Goals (không server, không tài khoản game, không lưu giữa trận)
- `../docs/01-product/journeys.md` — luồng người dùng US-01…US-05, kèm "Điều gì có thể sai" (nguồn chính cho case negative)
- `../docs/01-product/glossary.md` — tên khái niệm ↔ tên trong code ↔ tên trên UI (lõi/`cores`, ô, đợt…)
- `../docs/02-requirements/scope.md` — danh mục chức năng FR-01…FR-37 và trạng thái
- `../docs/02-requirements/nfr.md` — ngưỡng NFR-PERF / SEC / A11Y / I18N / REL / DATA áp cho mọi feature
- `../docs/03-design/invariants.md` — điều kiện sai âm thầm (snapshot 10Hz, profile không throw/không xoá, canvas vừa khung, min-height thẻ bản đồ, thứ tự nạp auth)
- `../docs/decisions/` — ADR-0001…0010: vì sao hành vi như vậy (vd ADR-0005 profile có schemaVersion, ADR-0009 xây ba bước, ADR-0010 đăng nhập Ducker ID sau cờ)
- `../docs/specs/<feature>/design.md` — thiết kế đã duyệt của từng feature (tower-defense-v1, ux-fixes-persona-2026-09, ducker-id-sign-in)
- `../docs/design-system/tower-defense/MASTER.md` — ngưỡng hiển thị (vùng bấm 44px, tương phản, bố cục theo mốc bề rộng)
- `../README.md` — mục Features + Controls: hợp đồng hành vi hướng tới người chơi

## Code

- `../client/src/i18n/vi.ts`, `../client/src/i18n/en.ts` — mọi chuỗi UI hai locale, nguồn của `src/data/copy.ts`
- `../client/src/App.tsx` — điều phối màn hình (tiêu đề, chọn bản đồ, xưởng, cài đặt, trận, kết quả) và ghi tiến trình sau trận
- `../client/src/views/` — từng màn: Title, MapSelect, Workshop, Settings, Battle (HUD, thẻ tháp, panel tháp, lớp ô, phím tắt), Result
- `../client/src/components/` — Press, Segmented, Chip, StorageNotice, AccountButton (dùng chung các màn)
- `../client/src/storage/profile.ts` — đọc/ghi profile phòng vệ (giữ bản hỏng, sửa trường sai, không ghi được)
- `../client/src/core/`, `../client/src/data/` — luật trận, kinh tế, phần thưởng `cores`, số liệu tháp/địch/bản đồ/cây nâng cấp
- `../client/src/auth/`, `../client/src/hooks/useDuckerAuth.ts` — đăng nhập Ducker ID (OIDC + PKCE) sau cờ tính năng
- `../client/vite.config.ts`, `../.github/workflows/deploy.yml` — base path (`VITE_BASE_PATH`) của bản build và bản Pages

## Không đọc như nguồn đúng

- `../docs/specs/*/plan.md` — danh sách task lúc build, không phải hành vi
- `../docs/04-state/backlog.md` — việc đang làm / nợ kỹ thuật, không phải hành vi đã ship
- `../docs/code-conventions.md` — quy ước viết code dùng chung, không nói về hành vi
- `../docs/ux-reviews/` — nhật ký phiên persona 2026-09-11 (phát hiện UX lịch sử, đã xử lý ở `ux-fixes-persona-2026-09`)
- `../client/tests/` — unit test (vitest) của app, gồm cổng cân bằng FR-32: gợi ý hành vi, không phải requirement

## Thứ tự thẩm quyền

User (chat) > tài liệu trên > code. Code cho biết app *đang* làm gì, không cho biết *nên* làm gì.
