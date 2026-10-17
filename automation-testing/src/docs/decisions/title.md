# TITLE — Quyết định

Đi cặp với `docs/requirements/title.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-14, FR-34, FR-11, FR-13), `docs/01-product/journeys.md` (US-01
  bước 1–2, US-03 bước 1), `docs/specs/ux-fixes-persona-2026-09/design.md` (FR-34: "CHƠI TIẾP" bị đọc thành "chơi tiếp
  từ đợt 9"), `README.md` §Features.
- **Code:** `client/src/views/Title/index.tsx` (`hasProgress`, `resumeMap`, `title.lastMap`), `client/src/App.tsx`
  (`playNext`: `lastMap` ?? bản đồ mở cuối ?? m01), `client/src/storage/profile.ts` (`unlockedMaps`),
  `client/src/i18n/vi.ts`.
- **Test đã gom (gợi ý):** không có spec cũ nào cho riêng màn này; các spec cũ chỉ đi qua nút "CHƠI".

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** US-03 bước 1 nói nút chính là "chơi tiếp" và "ghi rõ đang dở bản đồ nào"; FR-34 (sau persona) đổi thành "CHƠI"
  + dòng kỷ lục. Theo cái nào? → FR-34: nó mới hơn, có thiết kế đã duyệt (`ux-fixes-persona-2026-09`) và README nói như
  vậy. US-03 là văn bản cũ chưa cập nhật chữ, ý ("biết bản đồ nào") vẫn giữ qua dòng kỷ lục. → REQ-TITLE-03.
- **Q2** "CHƠI" không có `lastMap` nhưng đã mở nhiều bản đồ thì vào đâu? Docs không nói; code vào bản đồ mở cuối cùng —
  hợp với "không phải làm lại bước nào" của US-03 → chấp nhận làm requirement (REQ-TITLE-04, TC-TITLE-005).
- **Q3** Kiểm "vào đúng bản đồ" thế nào khi tên bản đồ không hiện trong trận? → bằng HUD: tổng số đợt và vàng/mạng khởi
  đầu khác nhau giữa các bản đồ (m01 12 đợt/260 vàng/20 mạng, m02 14 đợt/240 vàng/18 mạng).

## Tài khoản test

Không có — game không có tài khoản. Tiến trình gieo thẳng vào `localStorage` (`TitlePage.seedProfile`).

## Ngoài phạm vi

- Đổi ngôn ngữ ở màn tiêu đề: module `i18n`. Nút đăng nhập Ducker ID: module `ducker-id`.
- NFR-PERF-09 (≤ 3 giây tới khi bấm được trên 4G mô phỏng): đo bằng Lighthouse, không phải e2e chức năng.

## Tech debt liên quan

_(không có)_
