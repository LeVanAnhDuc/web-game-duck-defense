# BUILD — Test cases

Requirement: `docs/requirements/build.md` · quyết định: `docs/decisions/build.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Mọi case: trận Đồng Cỏ (260 vàng), viewport 1440×900.

### TC-BUILD-001 — chạm ô trống chỉ chọn ô, không trừ vàng

- **Requirement:** REQ-BUILD-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** chạm "Ô số 8"
- **Mong đợi:** ô 8 `aria-pressed=true`; Vàng 260; thẻ Cung 60, Pháo 110, Băng 90; nút "Chọn một loại tháp" bị vô hiệu
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-002 — chạm thẻ tháp chỉ chọn loại và hiện số liệu trước khi trả tiền

- **Requirement:** REQ-BUILD-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** chạm "Ô số 8" → thẻ Cung
- **Mong đợi:** thẻ Cung `aria-pressed=true`; Vàng 260; Sát thương 12 · Tầm bắn 78 · Nhịp bắn "0,8 s"; nút "XÂY · 60"
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-003 — chỉ nút XÂY mới trừ tiền và ô thành ô đã xây

- **Requirement:** REQ-BUILD-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** chạm "Ô số 8" → Cung → "XÂY · 60" → chạm "Ô số 3"
- **Mong đợi:** Vàng 200; ô 8 đọc "Ô số 8 — đã xây"; ô 3 vẫn "Ô số 3"
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-004 — không đủ vàng thì thẻ tháp bị vô hiệu và đổi icon xu thành icon khoá

- **Requirement:** REQ-BUILD-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** xây Pháo ở ô 8 và ô 9 (còn 40 vàng)
- **Mong đợi:** Vàng 40; ba thẻ đều `disabled`; icon giá của thẻ Cung khác icon giá lúc còn đủ tiền
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-005 — vàng vừa đúng bằng giá thì thẻ vẫn chọn và xây được

- **Requirement:** REQ-BUILD-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** xây Pháo ô 8 + Băng ô 9 (còn 60 vàng) → ô 3 → Cung → "XÂY · 60"
- **Mong đợi:** trước khi xây: Cung bấm được, Pháo và Băng `disabled`; sau khi xây: Vàng 0
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-006 — Huỷ và Esc bỏ chọn mà không trừ vàng

- **Requirement:** REQ-BUILD-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** ô 8 → Cung → "Huỷ"; rồi ô 9 → Băng → Esc
- **Mong đợi:** mỗi lần: ô hết `aria-pressed`, nút xác nhận biến mất, Vàng 260
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-007 — chọn loại tháp trước rồi chạm ô vẫn phải bấm xác nhận

- **Requirement:** REQ-BUILD-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** phím `1` → chạm ô 8 → (kiểm) → "XÂY · 60"
- **Mong đợi:** sau phím `1` thẻ Cung được chọn; sau khi chạm ô Vàng vẫn 260 và nút "XÂY · 60" hiện; sau khi bấm Vàng 200
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-008 — chạm lại thẻ đang chọn thì bỏ chọn loại tháp

- **Requirement:** REQ-BUILD-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** ô 8 → Pháo → Pháo
- **Mong đợi:** thẻ Pháo `aria-pressed=false`; nút "Chọn một loại tháp" bị vô hiệu; Vàng 260
- **Automated:** `tests/e2e/build/three-step.e2e.ts`

### TC-BUILD-009 — chọn lại ô đã xây không mở bảng xây chồng lên tháp

- **Requirement:** REQ-BUILD-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** xây Cung ô 8 → chạm ô 3 → chạm lại ô 8
- **Mong đợi:** panel "Cung · Bậc 1" hiện; không có nút xác nhận xây; Vàng 200
- **Automated:** `tests/e2e/build/three-step.e2e.ts`
