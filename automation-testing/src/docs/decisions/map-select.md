# MAPSELECT — Quyết định

Đi cặp với `docs/requirements/map-select.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-13, FR-26, FR-34, FR-35), `docs/01-product/journeys.md` (US-03
  bước 2 "cái nào đã qua, cái nào khoá, khoá vì thiếu gì"), `docs/03-design/invariants.md` #13,
  `docs/specs/ux-fixes-persona-2026-09/design.md` (F-03 thẻ bản đồ ở 375px), `docs/02-requirements/nfr.md` (NFR-A11Y-06).
- **Code:** `client/src/views/MapSelect/index.tsx` (`MapCard`: badge, detail, `disabled={locked}`, `min-h-fit`),
  `client/src/storage/profile.ts` (`lockReason`, `unlockedMaps`), `client/src/i18n/vi.ts` (`mapSelect.*`).
- **Test đã gom (gợi ý):** `client/e2e/map-card-narrow.spec.ts` → `tests/e2e/map-select/map-cards.e2e.ts`
  (thành TC-MAPSELECT-005, phép kiểm hình học giữ nguyên, chuyển vào `MapSelectPage.clippedCardText`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** FR-13 chỉ nói "hiện lý do khi còn khoá" — mở khoá theo luật nào? → Code: bản đồ n+1 mở khi bản đồ n đã qua
  (`unlockedMaps`); README "unlocked in order" nói cùng ý → chấp nhận làm requirement (REQ-MAPSELECT-02).
- **Q2** Thẻ khoá "không bấm được" kiểm thế nào? → thẻ `disabled`, và cú bấm cưỡng bức (`force`) vẫn để người chơi ở màn
  chọn bản đồ — đó là hành vi người chơi thấy (TC-MAPSELECT-004, lăng kính 5).
- **Q3** NFR-A11Y-06 cho trạng thái khoá: kênh thứ hai là gì? → chữ "Chưa mở" + icon khoá (không chỉ grayscale). Chỉ
  kiểm phần chữ (máy đọc được); icon là SVG `aria-hidden`.

## Tài khoản test

Không có. Tiến trình gieo vào `localStorage`.

## Ngoài phạm vi

- Thumbnail bản đồ (SVG vẽ từ waypoint) — trang trí, không phải hành vi.
- Tràn ngang toàn màn ở các mốc bề rộng: module `responsive`. Hai locale: module `language`.

## Tech debt liên quan

_(không có)_
