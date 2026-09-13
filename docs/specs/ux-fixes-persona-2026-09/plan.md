# Plan — sửa bốn phát hiện UX từ lượt chạy persona 2026-09-11

Thiết kế: `design.md`. Nhánh: `fix/ux-persona-2026-09`, worktree `.worktrees/ux-fixes`.
TDD mỗi task: test đỏ trước, code sau.

## 1 · FR-36 + F-08 — rẻ nhất, không đụng luồng nào

- [x] 1.1 `index.html` + `public/favicon.svg`: thêm favicon, hết 404 ở 7/7 phiên (F-08)
- [x] 1.2 `i18n/vi.ts` + `en.ts`: `battle.keyHint` nói đúng điều kiện của Space
- [x] 1.3 `CallWaveButton`: khi nút đang giữ focus mà bị disable → chuyển focus sang nút
      Tạm dừng, không thả về `<body>` (NFR-A11Y-02)
- [x] 1.4 `views/Battle/index.tsx`: vào màn trận thì focus điểm vào đầu tiên, không để
      `<body>` giữ focus
- [x] 1.5 test: viết trong `e2e/a11y-i18n-perf.spec.ts` thay vì một file riêng — cùng chủ đề
      với test bàn phím đã có sẵn ở đó. Assert `activeElement !== body` ở mọi bước, và test
      này đã bắt được một lỗi thật: `backRef` còn null vì thanh HUD chỉ render sau snapshot
      đầu tiên, nên effect chạy một lần lúc mount không focus được gì

## 2 · FR-34 — chỉ chữ, không đụng hành vi

- [x] 2.1 `i18n`: `title.lastMap` → "kỷ lục đợt N/M"; `mapSelect.playing` → "Chưa qua";
      `mapSelect.best` → "Kỷ lục: đợt N/M"
- [x] 2.2 `views/Title/index.tsx`: nút chính luôn `title.play`, bỏ nhánh `title.continue`
- [x] 2.3 gỡ khoá `title.continue` khỏi cả hai từ điển (giữ parity vi/en)
- [x] 2.4 test: `tests/core/i18n.test.ts` vẫn xanh (parity khoá), và không chuỗi nào
      còn chữ "TIẾP"/"Continue" trên nút chính

## 3 · FR-35 — bố cục thẻ bản đồ

- [x] 3.1 test: `e2e/map-card-narrow.spec.ts` ở 375×720 — mọi thẻ phải hiện
      **tên bản đồ** và **dòng chi tiết**, và `scrollHeight <= clientHeight + 1` của
      chính thẻ (không bị cắt)
- [x] 3.2 `views/MapSelect/index.tsx`: bỏ `!min-h-0`, thẻ xếp ngang ở bề rộng hẹp
- [x] 3.3 `invariants.md`: thêm bất biến #13 — grid item bỏ sàn `min-height` cộng
      `overflow-hidden` thì nội dung biến mất không một dấu vết

## 4 · FR-33 — luồng xây tháp ba bước (việc lớn nhất)

- [x] 4.1 `bridge/types.ts`: `buildOptions` mang thêm `damage`, `range`, `cooldownTicks`
- [x] 4.2 `game/BattleScene.ts`: `buildOptions` điền từ `rules.towers[id].levels[0]`
      (đã áp nâng cấp — invariants #8)
- [x] 4.3 `game/BattleScene.ts`: `setPreviewTower(id | null)` + `drawOverlay` vẽ vòng
      tầm bắn ứng viên tại ô đang chọn, **trước khi** trả tiền
- [x] 4.4 `game/boot.ts`: `GameHandle.setPreviewTower`
- [x] 4.5 `views/Battle/index.tsx`: state `candidate`, chạm thẻ tháp = chọn ứng viên
      (không trả tiền), thêm nút `XÂY · <giá>` và `Huỷ`
- [x] 4.6 `TowerDetail`: hiện Sát thương · Tầm bắn · Nhịp bắn
- [x] 4.7 `BattleShortcuts`: `1 2 3` chọn ứng viên; Enter trên nút xây mới trả tiền
- [x] 4.8 test: trong `e2e/us01-play.spec.ts` — chạm ô rồi chạm thẻ tháp thì **vàng
      không đổi**; chỉ sau khi bấm XÂY vàng mới giảm đúng giá
- [x] 4.9 ADR-0009: vì sao chấp nhận thêm một thao tác mỗi lần xây

## 5 · Đóng

- [x] 5.1 `scope.md`: FR-33…FR-36 trạng thái `xong`
- [x] 5.2 README `## Features`: một dòng tiếng Anh
- [x] 5.3 `pnpm lint` sạch · `tsc --noEmit` sạch · `vitest` 230/231 · `playwright` 25/25
      Một test đỏ **không phải của đợt này**: `tests/balance/determinism.test.ts` (ngưỡng
      200ms, đo 577-622ms) — đã nằm sẵn ở §Nợ kỹ thuật từ trước, và đợt này không chạm
      `core/` một dòng nào.
- [x] 5.4 soi app thật ở 375 / 768 / 1024 / 1440, không bề rộng nào tràn ngang

## Hai thứ chỉ lộ ra khi soi app thật

Cả hai đều là hệ quả của FR-33, và cả hai đều không test nào bắt được:

1. **Bàn chơi bị bóp ở 375.** Thanh đáy và bàn chơi chia nhau cùng chiều cao, nên bảng xây
   cao thêm bao nhiêu thì bàn chơi thấp đi bấy nhiêu: mở bảng xây ra là canvas tụt từ 375px
   xuống **206px** — mà bàn chơi lại đúng là chỗ phải nhìn để biết vòng tầm bắn có chạm
   đường đi không. Đã lấy lại bằng ba việc: bỏ tiêu đề "Xây tháp" ở bố cục dọc, dồn ba chỉ
   số thành MỘT dòng thay vì lưới hai tầng, và giấu hàng tốc độ trong lúc đang chọn chỗ.
   Kết quả **266px**, và ba bề rộng còn lại không đổi (bảng nằm ở cột bên).
2. **`0.8 s` thay vì `0,8 s`.** `translate` chỉ định dạng số theo locale khi tham số là
   `number`; truyền `toFixed(1)` là truyền chuỗi nên nó đi thẳng ra ngoài. Vi phạm
   NFR-I18N-03 mà test parity khoá không thấy được. Đã làm tròn rồi truyền số.
