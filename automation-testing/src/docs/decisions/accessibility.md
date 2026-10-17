# ACCESSIBILITY — Quyết định

Đi cặp với `docs/requirements/accessibility.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-19, FR-29, FR-36), `docs/02-requirements/nfr.md` (NFR-A11Y-02, -03, -05,
  -07), `docs/specs/ux-fixes-persona-2026-09/design.md` (FR-36: hai lần mất dấu focus của persona bàn phím),
  `docs/design-system/tower-defense/MASTER.md` §5 (phím tắt là đường tắt, không phải đường duy nhất), `README.md` §Controls.
- **Code:** `client/src/views/Battle/components/SlotOverlay` (nút DOM ≥ 44px trên canvas), `ghosts/BattleShortcuts`
  (Space nhường nút đang focus), `CallWaveButton` (`aria-disabled` thay `disabled`), `client/src/views/Battle/index.tsx`
  (đặt focus vào nút quay lại khi focus vô chủ), `BattleLiveRegion`, `client/src/components/Press` (`min-h-[44px]`),
  `client/src/tailwind.css` (`prefers-reduced-motion`).
- **Test đã gom (gợi ý):** `client/e2e/a11y-i18n-perf.spec.ts` → `tests/e2e/accessibility/keyboard.e2e.ts`: "đặt được tháp
  CHỈ bằng bàn phím" (→ TC-ACCESSIBILITY-001), "focus không bao giờ rơi về <body>" (→ TC-ACCESSIBILITY-002/003), "Esc bỏ chọn, và Space gọi
  đợt" (→ TC-ACCESSIBILITY-005); case HUD 10Hz sang `performance`, hai case locale sang `language`. `client/e2e/review-regressions.spec.ts`
  "Space trên một nút đang focus" (→ TC-ACCESSIBILITY-006) và "Space khi không focus nút nào" (gộp vào TC-ACCESSIBILITY-005).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** README §Controls bảng phím: "`Tab` to a slot, then `Enter`" là "Build on the focused slot" — sau FR-33 Enter chỉ
  CHỌN ô. Theo cái nào? → FR-33 (xem `decisions/build.md` Q1); test kiểm Enter không trả tiền, rồi tới nút xây.
- **Q2** "Focus thấy được" đo thế nào? → `outline-style` ≠ none và `outline-width` > 0 của phần tử đang focus — đúng cách
  case cũ đã đo; không so màu.
- **Q3** NFR-A11Y-03 "trên thiết bị cảm ứng" — đo ở đâu? → viewport 375×812 (bố cục dọc điện thoại), đo `boundingBox` thật
  của từng vùng bấm, sai số 0,5px làm tròn.
- **Q4** NFR-A11Y-05 còn "giảm hiệu ứng hạt trong canvas" — FR-19 ghi rõ phần đó ⚪ chưa áp dụng (không có hạt). Chỉ kiểm
  chuyển động của giao diện.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Nghe thật bằng screen reader (backlog "Kiểm bằng screen reader thật") — thử tay.
- Tương phản màu (NFR-A11Y-01): đo bằng script trong `MASTER.md` §1.1b, không phải e2e. Trạng thái không chỉ bằng màu
  (NFR-A11Y-06): đã kiểm ở chỗ của nó (thẻ tháp `build`, thẻ bản đồ `map-select`).

## Tech debt liên quan

- `README.md` §Controls dòng "Build on the focused slot | Tab to a slot, then Enter" chưa theo FR-33 (xem Q1).
