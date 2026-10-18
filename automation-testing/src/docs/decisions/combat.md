# COMBAT — Quyết định

Đi cặp với `docs/requirements/combat.md`. Module thêm ở lượt follow-up 2026-10-18: bộ test đầu tiên phủ mọi FR người
chơi thấy trừ FR-01, FR-04, FR-20, FR-21 và hai dòng tháp mở khoá (README §Features "Five tower lines", "Three enemy
types"). Lượt follow-up thứ hai cùng ngày thêm tác dụng của Sét (REQ-COMBAT-09) và của giáp / xuyên giáp
(REQ-COMBAT-10) — Q8, Q9; Q5 cũ được thay bằng Q8.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-01, FR-04, FR-05, FR-06, FR-12, FR-20, FR-21, FR-24, FR-33),
  `docs/specs/tower-defense-v1/design.md` §2 (một tick năm bước: `s += speed · slowFactor · FIXED_DT`, leak trừ
  `enemyType.leak`, nổ lan trúng **toàn bộ** sát thương mọi enemy trong bán kính, sát thương thực
  `max(1, damage − armor)` trừ khi `pierceArmor`, chết thì `gold += bounty`), §Kiểm thử (làm chậm có thời hạn, không cộng
  dồn), `docs/03-design/invariants.md` #4 (FIXED_DT = 1/60 s), `README.md` §Features.
- **Code:** `client/src/data/enemies.ts` (speed / armor / bounty / leak), `client/src/data/towers.ts` (giá, số liệu từng
  bậc, `pierceArmor`, `unlockedAtStart`), `client/src/data/upgradeTree.ts` (`unlockBolt`, `unlockVenom`),
  `client/src/data/maps/m01-dong-co.ts`, `m04-deo-gio.ts`, `m05-lo-ren-cu.ts` (waypoint, đợt đầu),
  `client/src/views/Battle/components/TowerDetail` (mô tả + số liệu trước khi trả tiền), `client/src/i18n/vi.ts`, `en.ts`,
  `client/src/game/BattleScene.ts` (`MAX_STEPS_PER_FRAME = 30`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Canvas không đọc được qua DOM: làm sao thấy tốc độ, giáp, nổ lan, làm chậm? → chỉ qua hệ quả trên HUD: khoảnh khắc
  mạng tụt (địch tới cuối đường), số mạng mất, vàng tăng bao nhiêu và trong frame nào. Công thức thì đã có unit test ở
  `client/tests/core/` (`advance.test.ts`: tiến `speed · dt`, chậm hết hạn đúng tick, Giáp trừ hai mạng;
  `projectiles.test.ts`: trừ giáp, xuyên giáp, sàn 1, nổ lan trong bán kính, làm chậm không cộng dồn) — e2e chứng minh
  người chơi thấy đúng điều đó trong bản build thật, không lặp lại phép tính.
- **Q2** Đo tốc độ thế nào cho ổn định? → đồng hồ **đứng yên** (`BattlePage.useFrozenClock`: `page.clock.install` rồi
  `pauseAt`). Chỉ `install` thì đồng hồ vẫn chạy theo thời gian thật giữa hai bước, máy chậm (nhiều worker) lọt thêm thời
  gian game: lượt thử đầu đo con Lính đầu tiên tới đích sau 11 frame thay vì ~162. Đứng yên thì mỗi frame đúng 200 ms
  game (12 tick ở x1): Lính 162 frame, Chạy nhanh 98, Giáp 238 — lặp lại y hệt ở 1 và 4 worker. Tốc độ đo = chiều dài
  đường / thời gian tới lúc mất mạng đầu tiên; HUD 10 Hz và bước 200 ms làm con số đo **thấp** hơn thật vài phần trăm
  (33,1 / 59,4 / 25,5 so với 34 / 62 / 26), nên dung sai lệch là −8 % / +3 %. Chiều dài đường cộng từ waypoint trong
  `data/maps/` (Đồng Cỏ 1072, Đèo Gió 1164, Lò Rèn Cũ 1214) và ghi ở `src/data/test-data.ts`.
- **Q3** Trên đồng hồ đứng yên, `click()` của Playwright treo (kiểm "ổn định" chờ animation frame không bao giờ tới). →
  `BattlePage.press`: click `force` rồi bước một frame. Chỉ dùng khi đồng hồ đứng yên; các module khác giữ nguyên.
- **Q4** Nổ lan: chứng minh "một phát trúng nhiều địch" bằng gì? → chỉ MỘT Pháo trên bàn, vàng tăng đúng 2 × 11 trong
  cùng một frame. Pháo nạp lại 110 tick, một frame 12 tick: hai con chết trong một frame chỉ có thể là cùng một phát.
- **Q5** _(thay bằng Q8)_ Giáp và xuyên giáp (FR-21): thử so một Độc với một Cung ở cùng ô trên đợt 5 Giáp của Lò Rèn Cũ — cả hai đều không
  diệt được con nào ở cả sáu ô gần đường (Độc nhắm "con nhiều máu nhất" nên rải sát thương sang con mới). Không có bố trí
  nào cô lập được riêng tác dụng của giáp chỉ bằng HUD mà không trộn sát thương danh nghĩa và nhịp bắn. → e2e chỉ chứng
  minh phần người chơi thấy: Độc **nói** "Xuyên giáp" trước khi trả tiền (REQ-COMBAT-08) và Giáp lì đòn tới mức cần hai
  Pháo + hai Cung mới diệt đủ năm con (TC-COMBAT-006). Công thức giáp ở unit test (Q1). Đây không phải bug: thiết kế
  `strongest` là chủ ý (`design.md` §3).
- **Q6** Làm chậm (FR-20) "có thời hạn, không cộng dồn" không thấy được qua HUD. → e2e chỉ kiểm phần thấy được (địch tới
  muộn ≥ 10 % mà không chết); thời hạn và không cộng dồn thuộc unit test (Q1).
- **Q7** Vào thẳng Đèo Gió / Lò Rèn Cũ: gieo profile có các bản đồ trước đã qua và `lastMap`, rồi bấm CHƠI (REQ-TITLE-04),
  không chơi qua bốn bản đồ.
- **Q8** Giáp và xuyên giáp thấy được thế nào trên HUD (thay Q5)? → bằng một bố trí có kết cục khác hẳn tuỳ có xuyên giáp
  hay không. Game chạy đúng mô phỏng tất định của `client/src/core` (bước cố định, seed không điều khiển gì), nên kết cục
  một đợt tính trước được chính xác: dựng trận bằng `createBattle` → `build` → `startWave` → `step` tới hết đợt, rồi chạy
  lại cùng trận với `rules.towers.venom.pierceArmor = false`. Quét mọi ô của Lò Rèn Cũ (đợt 1, 5 Giáp): Độc một mình
  không diệt con nào dù có xuyên giáp hay không (đó là lý do Q5 bỏ cuộc), nhưng Độc ô 1 + Pháo ô 6 thì có xuyên giáp diệt
  đủ 5, không mất mạng; không xuyên giáp chỉ diệt 2, mất 6 mạng — đúng bằng Pháo ô 6 một mình. e2e chơi hai trận thật:
  Pháo một mình (TC-COMBAT-014, đối chứng, và cũng là bằng chứng giáp KHÔNG làm tháp thường vô dụng) và Độc + Pháo
  (TC-COMBAT-013). Số liệu ghi ở `src/data/test-data.ts` → `COMBAT_SCENARIOS`. Đã thử đột biến: build với
  `venom.pierceArmor = false` thì TC-COMBAT-013 đỏ.
  Một tiêu chí ở vòng kiểm trước viết "dòng Giáp chỉ bị sát thương xuyên giáp làm đau" — sai với game: luật là
  `max(1, damage − armor)` trừ khi `pierceArmor` (`design.md` §2, `enemies.ts` armored armor 6), tháp thường vẫn gây
  sát thương. REQ-COMBAT-10 viết theo luật thật, TC-COMBAT-014 khẳng định điều ngược lại tiêu chí đó.
- **Q9** Sét "nổ lan rộng" thấy được thế nào? → như Q4 cho Pháo: chỉ MỘT Sét trên bàn, Sét nạp lại 60 tick > 12 tick một
  frame, nên frame có vàng tăng 2 × 11 là một phát diệt hai Lính. Quét mô phỏng (Q8) mọi ô của năm đợt đầu: không bố trí
  nào cho một phát Sét diệt 4 con — điều duy nhất bán kính 30 của Pháo không làm được trên đường thẳng — nên độ "rộng" được
  chứng minh bằng đối chứng cùng ô: Sét ở ô 7 Đồng Cỏ có hai phát mỗi phát diệt hai Lính, Pháo ở ô 7 cả đợt chỉ diệt một
  (TC-COMBAT-012 / 015). Đã thử đột biến: build với bán kính Sét 30 thì TC-COMBAT-012 đỏ.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Luật ngắm (`first`, `strongest`), tầm bắn từng bậc khi nâng — chỉ có trong canvas. Bán kính nổ đo bằng đơn vị bản đồ
  (44 so với 30) không đọc được; e2e chỉ thấy hệ quả của nó (Q9), con số thuộc unit test.
- Nâng cấp và bán tháp: module `tower`. Mua mở khoá ở xưởng (luồng mua): module `workshop` (TC-WORKSHOP-011).
- Lính trừ một mạng và ra 11 vàng: module `wave` (TC-WAVE-004, TC-WAVE-005).

## Tech debt liên quan

_(không có)_
