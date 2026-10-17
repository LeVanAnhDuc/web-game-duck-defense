# Test đã gom về lúc scaffold

Bộ e2e Playwright cũ của app (`client/e2e/`, chạy bằng `client/playwright.config.ts` → `pnpm test:e2e`) được `git mv`
về đây khi dựng `automation-testing/`. Config cũ gộp vào `playwright.config.ts`: hai webServer (bản cờ tắt ở :5273, bản
bật cờ Ducker ID với issuer giả ở :5275 — giờ là bản build production qua `vite preview` thay cho `vite` dev), project
`app-auth` thay cho project `ducker-sign-in`.

| Từ | Về | Trạng thái |
|---|---|---|
| `client/e2e/us01-play.spec.ts` | `src/tests/e2e/build/three-step.e2e.ts` (git mv): "xây tháp trừ đúng tiền…" → TC-BUILD-001/003, "không đủ tiền…" → TC-BUILD-004; "bán tháp…" → TC-TOWER-005, "gọi đợt…" → TC-WAVE-003/004 | đã chuẩn hóa |
| `client/e2e/review-regressions.spec.ts` | `src/tests/e2e/tower/upgrade-sell.e2e.ts` (git mv): nâng cấp làm mới panel → TC-TOWER-002, bậc cuối → TC-TOWER-003, ô đã xây → TC-TOWER-007; Space trên nút / Space không focus → TC-ACCESSIBILITY-006/005, nạp asset thất bại → TC-LOADING-001/002, thanh tiến độ bắt đầu ở 0 → TC-WAVE-001, canvas vừa khung → TC-RESPONSIVE-002 | đã chuẩn hóa |
| `client/e2e/a11y-i18n-perf.spec.ts` | `src/tests/e2e/accessibility/keyboard.e2e.ts` (git mv): ba case bàn phím/focus → TC-ACCESSIBILITY-001/002/003/005; hai case locale 375px → `language/language.e2e.ts` TC-LANGUAGE-005/006; HUD 10Hz → `performance/hud-rate.e2e.ts` TC-PERFORMANCE-001 | đã chuẩn hóa |
| `client/e2e/look.spec.ts` | `src/tests/e2e/responsive/layout.e2e.ts` (git mv) → TC-RESPONSIVE-001 (bỏ phần chụp ảnh, giữ phép kiểm không cuộn ngang ở năm mốc) | đã chuẩn hóa |
| `client/e2e/map-card-narrow.spec.ts` | `src/tests/e2e/map-select/map-cards.e2e.ts` (git mv) → TC-MAPSELECT-005; phép đo hình học vào `MapSelectPage.clippedCardText` | đã chuẩn hóa |
| `client/e2e/ducker-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts` (git mv) → TC-DUCKERID-003…011; issuer giả → `src/fixtures/issuer.fixture.ts` | đã chuẩn hóa |
| `client/e2e/ducker-sign-in-off.spec.ts` | `src/tests/e2e/ducker-id/flag-off.e2e.ts` (git mv) → TC-DUCKERID-001/002 | đã chuẩn hóa |
| `client/e2e/look-running.spec.ts` | — (xoá) | bỏ: chỉ chụp ảnh trận đang chạy để người xem, không có một assertion nào — không chứng minh được hành vi |
| `client/playwright.config.ts` (2 webServer `vite` dev, project `chromium` + `ducker-sign-in`) | `playwright.config.ts` | gộp |

Unit test (vitest, `client/tests/**`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — số liệu "23 test e2e" là ảnh chụp trạng thái lúc ghi, không phải luật.
- `docs/code-conventions.md` §bảng tiến độ ("21 test + 5 e2e") — ảnh chụp lúc rà quy ước, không phải luật.
- `docs/ux-reviews/` — nhật ký phiên persona cũ.
