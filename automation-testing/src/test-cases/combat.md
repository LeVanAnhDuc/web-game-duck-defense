# COMBAT — Test cases

Requirement: `docs/requirements/combat.md` · quyết định: `docs/decisions/combat.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.
Mọi case: viewport 1440×900, tốc độ x1. Case chạy một đợt dùng đồng hồ đứng yên (`BattlePage.useFrozenClock`, mỗi frame
đúng 200 ms game). Vào Đèo Gió / Lò Rèn Cũ bằng profile gieo sẵn (các bản đồ trước đã qua, `lastMap`) rồi bấm CHƠI.

### TC-COMBAT-001 — dải Đợt tới gọi Chạy nhanh và Giáp bằng tên riêng

- **Requirement:** REQ-COMBAT-01
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** vào trận Đèo Gió → quay lại → chọn Lò Rèn Cũ
- **Mong đợi:** "10× Chạy nhanh" ở Đèo Gió; "5× Giáp" ở Lò Rèn Cũ
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-002 — Lính đi khoảng 34 đơn vị mỗi giây

- **Requirement:** REQ-COMBAT-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** Đồng Cỏ, không xây → gọi đợt 1 (5 Lính) → đếm frame tới lúc mạng tụt lần đầu
- **Mong đợi:** 1072 / thời gian nằm trong 34 −8 % … +3 %
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-003 — Chạy nhanh đi khoảng 62 đơn vị mỗi giây và mỗi con lọt qua trừ một mạng

- **Requirement:** REQ-COMBAT-02, REQ-COMBAT-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** Đèo Gió, không xây → gọi đợt 1 (10 Chạy nhanh) → chạy hết đợt
- **Mong đợi:** 1164 / thời gian tới lần mất mạng đầu nằm trong 62 −8 % … +3 % và lớn hơn tốc độ Lính; Mạng 16 → 6
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-004 — Giáp đi chậm nhất, khoảng 26 đơn vị mỗi giây, và mỗi con lọt qua trừ hai mạng

- **Requirement:** REQ-COMBAT-02, REQ-COMBAT-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** Lò Rèn Cũ, không xây → gọi đợt 1 (5 Giáp) → chạy hết đợt
- **Mong đợi:** 1214 / thời gian nằm trong 26 −8 % … +3 % và nhỏ hơn tốc độ Lính; Mạng 14 → 4 (không thua: biên còn 4 mạng)
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-005 — diệt Chạy nhanh thì mỗi con ra đúng 13 vàng

- **Requirement:** REQ-COMBAT-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** Đèo Gió → xây Cung ở ô 1, 2, 6 → gọi đợt 1 → chạy hết đợt
- **Mong đợi:** không mất mạng; Vàng tăng đúng 10 × 13 = 130; mỗi lần vàng tăng là bội số của 13
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-006 — diệt Giáp thì mỗi con ra đúng 28 vàng

- **Requirement:** REQ-COMBAT-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** profile có "Tiền khởi đầu" bậc 4 (520 vàng ở Lò Rèn Cũ)
- **Bước:** Lò Rèn Cũ → xây Pháo ô 2, 5 và Cung ô 1, 4 → gọi đợt 1 → chạy hết đợt
- **Mong đợi:** không mất mạng; Vàng tăng đúng 5 × 28 = 140; mỗi lần vàng tăng là bội số của 28
- **Automated:** `tests/e2e/combat/enemies.e2e.ts`

### TC-COMBAT-007 — một Pháo diệt hai Lính bằng cùng một phát nổ lan

- **Requirement:** REQ-COMBAT-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** Đồng Cỏ → xây đúng một Pháo ở ô 9 → gọi đợt 1 → ghi mọi lần vàng đổi theo frame
- **Mong đợi:** có một frame vàng tăng đúng 2 × 11 = 22 (Pháo nạp lại 110 tick > 12 tick một frame: cùng một phát)
- **Automated:** `tests/e2e/combat/towers.e2e.ts`

### TC-COMBAT-008 — Băng làm Lính tới cuối đường muộn hơn mà không diệt con nào

- **Requirement:** REQ-COMBAT-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** Đồng Cỏ → xây Băng ở ô 10 → gọi đợt 1 → đếm frame tới lúc mạng tụt lần đầu
- **Mong đợi:** thời gian > 1,1 × 1072 / 34 giây; vẫn mất đủ 5 mạng; vàng không đổi (không con nào chết)
- **Automated:** `tests/e2e/combat/towers.e2e.ts`

### TC-COMBAT-009 — chưa mở khoá thì bảng xây chỉ có Cung, Pháo, Băng

- **Requirement:** REQ-COMBAT-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** người mới → vào trận → chạm ô 8
- **Mong đợi:** đúng 3 thẻ tháp: Cung, Pháo, Băng; không có thẻ Sét, Độc
- **Automated:** `tests/e2e/combat/towers.e2e.ts`

### TC-COMBAT-010 — mở khoá Sét và Độc thì có năm dòng tháp, mỗi thẻ báo mô tả và số liệu trước khi trả tiền

- **Requirement:** REQ-COMBAT-07, REQ-COMBAT-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Tiền điều kiện:** profile đã mua `arrowDamage` 3, `unlockBolt`, `unlockVenom` và "Tiền khởi đầu" bậc 1 (310 vàng: thẻ
  Độc 300 mới chọn được — thẻ không đủ vàng bị vô hiệu hoá, REQ-BUILD-04)
- **Bước:** vào trận → chạm ô 8 → chọn thẻ Sét → chọn thẻ Độc
- **Mong đợi:** 5 thẻ; Sét: giá 260, "Nổ lan rộng, tầm ngắn.", 22 · 58 · "1 s"; Độc: giá 300, "Xuyên giáp, nhắm con nhiều
  máu nhất.", 16 · 74 · "0,7 s"; vàng vẫn 310
- **Automated:** `tests/e2e/combat/towers.e2e.ts`

### TC-COMBAT-011 — xây Độc trừ đúng giá và ô thành tháp Độc bậc 1

- **Requirement:** REQ-COMBAT-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** như TC-COMBAT-010 (310 vàng — vừa đủ một Độc)
- **Bước:** xây Độc ở ô 8 → chọn lại ô 8
- **Mong đợi:** Vàng 310 → 10; panel "Độc · Bậc 1"
- **Automated:** `tests/e2e/combat/towers.e2e.ts`
