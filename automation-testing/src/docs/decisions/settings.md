# SETTINGS — Quyết định

Đi cặp với `docs/requirements/settings.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-18 "đã thu hẹp: chỉ còn MỘT thanh trượt", FR-28),
  `docs/01-product/journeys.md` (US-04), `docs/02-requirements/nfr.md` (NFR-A11Y-02, NFR-A11Y-04 thu hẹp về thanh âm lượng
  và ô ngôn ngữ), `docs/04-state/backlog.md` §Nợ kỹ thuật (lý do bỏ nhạc nền — đọc để hiểu, không phải nguồn hành vi).
- **Code:** `client/src/views/Settings/index.tsx` (`Volume`: `<label htmlFor>`, `step=5`, `offLabel`),
  `client/src/game/audio.ts` (`playSound` thoát sớm khi `volume <= 0`, tiếng sinh bằng `OscillatorNode`),
  `client/src/views/Battle/ghosts/SyncAudioVolume`, `client/src/storage/profile.ts` (`settings.sfx`, mặc định 0,8).
- **Test đã gom (gợi ý):** không có.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** US-04 bước 3 nói "kéo âm lượng nhạc và hiệu ứng về 0, hoặc tắt riêng từng cái"; FR-18 đã thu hẹp còn một thanh.
  Theo cái nào? → FR-18 (mới hơn, ghi rõ lý do). REQ-SETTINGS-01 đòi KHÔNG có thanh nhạc nền — một thanh điều khiển thứ
  không tồn tại là tệ hơn.
- **Q2** "Phát tiếng" kiểm thế nào khi headless không có loa? → bọc `OscillatorNode.prototype.start` bằng init script để
  đếm số nguồn âm được bật. Mọi tiếng của game là oscillator sinh tại chỗ, nên đếm được đủ.
- **Q3** Đổi ngôn ngữ trong cài đặt: thuộc module nào? → module `i18n` (TC-I18N-002); module này chỉ kiểm nhóm ngôn ngữ có mặt.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Chất lượng / âm lượng nghe thật của tiếng — thử tay.
- "Giảm chuyển động" (FR-19): module `accessibility`.

## Tech debt liên quan

- FR-18: trường `settings.music` vẫn nằm trong profile (không migrate schema) dù không có thanh nhạc nền — đã ghi ở
  `backlog.md`, không phải hành vi người chơi thấy.
