# Thiết kế · `tower-defense-v1`

**Liên quan:** US-01 · US-02 · US-03 · US-04 · FR-01…FR-32 ·
NFR-PERF-05…10 · NFR-A11Y-01…07 · NFR-I18N-01 · NFR-I18N-03 · NFR-I18N-04 ·
NFR-REL-02…05 · NFR-SEC-07 · NFR-DATA-04 · NFR-DATA-05 ·
ADR-0001 · ADR-0002 · ADR-0003 · ADR-0004 · ADR-0005 · ADR-0006

Ranh giới module, luồng một frame và tech stack nằm ở `03-design/architecture.md`.
Bất biến nằm ở `03-design/invariants.md`. Màu, chữ, khoảng cách nằm ở
`design-system/tower-defense/MASTER.md`. **File này không lặp lại chúng** — nó điền
những gì ba file kia cố ý không chứa: hình dạng dữ liệu cụ thể, luật chơi cụ thể,
xử lý lỗi, và chiến lược test.

---

## 1. Hình dạng state của một trận

```ts
type BattleState = {
  tick: number;                 // đếm tick, không phải ms
  phase: 'prep' | 'wave' | 'won' | 'lost';
  gold: number;
  lives: number;
  waveIndex: number;            // 0-based trong code, hiện +1 trên UI
  spawnCursor: number;          // đã sinh tới phần tử thứ mấy của lịch đợt
  spawnTimer: number;           // tick còn lại tới lần sinh kế tiếp
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  rng: RngState;
  stats: { killed: number; leaked: number; goldEarned: number };
};

type Enemy = {
  id: EntityId; typeId: EnemyTypeId;
  s: number;                    // quãng đường đã đi. KHÔNG lưu x,y — invariants #2
  hp: number;
  slowUntilTick: number;        // 0 = không bị làm chậm
  slowFactor: number;           // hệ số nhân tốc độ khi đang bị chậm
};

type Tower = {
  id: EntityId; typeId: TowerTypeId;
  slotIndex: number;            // trỏ vào MapDef.slots
  level: number;                // bậc trong trận, 1-based
  cooldown: number;             // tick còn lại tới phát kế
  targetId: EntityId | null;
};

type Projectile = {
  id: EntityId; ownerTypeId: TowerTypeId;
  x: number; y: number;         // đạn CÓ toạ độ — nó không đi trên đường
  targetId: EntityId;
  speed: number; damage: number;
  splashRadius: number;         // 0 = đơn mục tiêu
  pierceArmor: boolean;
};
```

`gold`, `lives`, `damage` là **số nguyên**. Chỉ `s`, toạ độ đạn và hệ số làm chậm là
số thực — chúng không phải tiền, nên sai số cuối chữ số không đổi kết quả.

## 2. Một tick, năm bước

Thứ tự là bất biến `invariants.md` #1. Chi tiết từng bước:

**1 · Sinh enemy.** `spawnTimer` giảm 1. Bằng 0 thì lấy phần tử `spawnCursor` của
lịch đợt, sinh một enemy tại `s = 0`, đặt lại `spawnTimer` theo `interval` của phần
tử đó. Hết phần tử → `phase` vẫn là `'wave'` cho tới khi bản đồ sạch enemy.

**2 · Enemy tiến.** `s += speed · slowFactorHiệnTại · FIXED_DT`. Enemy nào có
`s >= path.length` thì: `lives -= enemyType.leak`, xoá enemy, `stats.leaked++`.
`lives <= 0` → `phase = 'lost'`, tick dừng ngay tại đây.

**3 · Tháp ngắm và bắn.** `cooldown` giảm 1. Bằng 0 thì chọn mục tiêu theo luật §3,
sinh một `Projectile`, đặt lại `cooldown`. Không có mục tiêu trong tầm → `cooldown`
giữ ở 0, tháp bắn ngay khi có mục tiêu.

**4 · Đạn bay và trúng.** Đạn tiến về toạ độ hiện tại của mục tiêu. `splashRadius = 0`
thì chỉ mục tiêu chịu sát thương; lớn hơn 0 thì mọi enemy trong bán kính đó chịu
**toàn bộ** sát thương (không giảm theo khoảng cách — đơn giản hơn và dễ đọc hơn cho
người chơi). Mục tiêu biến mất trước khi đạn tới → đạn **vẫn bay tới toạ độ cuối biết
được** rồi nổ ở đó; đạn nổ lan vì thế không bị mất trắng.

Sát thương thực = `max(1, damage - (pierceArmor ? 0 : enemyType.armor))`. Sàn 1 là
cố ý: giáp không bao giờ làm một tháp thành vô dụng tuyệt đối.

**5 · Dọn xác và xét kết thúc.** Enemy `hp <= 0`: `gold += enemyType.bounty`,
`stats.killed++`, xoá. Đạn đã nổ: xoá. Nếu `spawnCursor` đã hết lịch của đợt **và**
không còn enemy: đợt xong. Còn đợt sau → `phase = 'prep'`. Hết đợt cuối →
`phase = 'won'`.

## 3. Luật ngắm mục tiêu

Mặc định **`first`** — enemy đi xa nhất trong tầm, tức `max(s)`. Đây là lý do
`invariants.md` #2 tồn tại: với `s` thì luật này là một phép `max`, với `{x, y}` thì
phải đoán.

v1 chỉ có `first`. Ba luật khác (`last`, `strongest`, `closest`) là chỗ mở rộng đã
tính trước: hàm chọn mục tiêu nhận một `TargetingMode` và `data/towers.ts` khai báo
mode mặc định cho từng loại tháp — nên thêm luật mới về sau không đụng vào `step`.

"Trong tầm" đo bằng khoảng cách Euclid từ tâm slot tới `path.at(enemy.s)`, so với
`range` bình phương (không lấy căn).

## 4. Số liệu cân bằng — hình dạng, không phải giá trị

Giá trị cụ thể nằm trong `data/`, và `backlog.md` §Nợ kỹ thuật đã ghi rõ chúng là
phỏng đoán đầu tiên. Hình dạng thì cố định:

```ts
type TowerType = {
  id: TowerTypeId;
  cost: number;
  targeting: TargetingMode;
  pierceArmor: boolean;
  levels: {                     // levels[0] là bậc 1
    damage: number; rangeSq: number; cooldownTicks: number;
    splashRadius: number; slowFactor: number; slowTicks: number;
    upgradeCost: number;        // giá lên bậc kế; bậc cuối = null
  }[];
};

type EnemyType = { id; hp; speed; armor; bounty; leak };

type WaveEntry = { enemyId: EnemyTypeId; count: number; intervalTicks: number; delayTicks: number };

type MapDef = {
  id: MapId;
  waypoints: { x: number; y: number }[];   // polyline, đơn vị bản đồ
  slots: { x: number; y: number }[];
  startGold: number; startLives: number;
  waves: WaveEntry[][];                    // waves[i] là đợt thứ i+1
  referenceLayout: { slotIndex: number; towerId: TowerTypeId; level: number }[];
};
```

`referenceLayout` là **bố cục tháp tham chiếu** — nó không phải nội dung game, nó là
dữ liệu test cho FR-32. Nó sống trong `MapDef` chứ không trong file test, vì nó phải
được sửa **cùng lúc** với bản đồ; tách ra là để chúng lệch nhau.

**Trần sức mạnh của cây nâng cấp: full cây ≈ +60% tổng lực**, không phải +400%. Cây
càng dốc thì khoảng "bản đồ chơi được" càng hẹp, và với 5 bản đồ thì không có chỗ cho
một đường cong dốc.

Bậc nâng cấp toàn cục áp vào **lúc khởi tạo trận**, không áp lại giữa trận
(`invariants.md` #8). Cụ thể: `createBattle` nhận `upgrades` rồi sinh ra một bản
`TowerType[]` và `startGold`/`startLives` đã cộng hiệu ứng. `step` không bao giờ đọc
`upgrades`.

## 5. Xử lý lỗi

Game này không có mạng, không có server, nên không có lớp lỗi quen thuộc. Bốn lớp
thật sự có, và cả bốn đều phải xử lý:

| Lớp lỗi | Xảy ra khi | Xử lý | Liên quan |
| --- | --- | --- | --- |
| **Nạp asset thất bại** | mất mạng giữa lúc tải atlas, hoặc file 404 sau khi deploy sai `base` | Màn nạp hiện lỗi cụ thể + nút thử lại. **Không** treo ở trạng thái loading vô hạn | NFR-REL-03 |
| **Profile không đọc được** | JSON hỏng · thiếu trường · kiểu sai · `schemaVersion` lạ · `localStorage` trả `null` | Không throw. Giữ bản cũ ở `profile.corrupt.<ts>`, tạo profile mới, hiện một thông báo giải thích | NFR-REL-04 · NFR-SEC-07 |
| **Profile không ghi được** | quota hết · tab riêng tư · trình duyệt chặn lưu trữ | Game **vẫn chơi được**. Hiện một dải cảnh báo bền: "tiến trình sẽ không được lưu". Không hỏi lại mỗi trận | NFR-REL-05 |
| **Trình duyệt chặn tự phát âm thanh** | luôn xảy ra trên Safari và Chrome mobile | Không phải lỗi. Hoãn khởi tạo audio tới tương tác đầu tiên của người chơi | US-04 |

Ba thứ **không** xử lý bằng `try/catch` mà bằng thiết kế:

- **Ý định không hợp lệ** (xây khi không đủ tiền, xây vào slot đã có tháp, nâng tháp
  đã max) — `bridge/` không đẩy chúng đi. UI đã vô hiệu hoá nút, và `applyIntent`
  kiểm lại rồi **bỏ qua im lặng**. Không có đường nào để UI làm `core/` vào state sai.
- **Bấm hai lần rất nhanh vào "mua nâng cấp"** (NFR-REL-02) — mỗi node mua xong thì
  bậc tăng, và giá bậc kế khác giá bậc vừa mua; lần bấm thứ hai đọc giá mới. Không
  cần khoá, chỉ cần đọc state chứ đừng đọc giá đã render.
- **Xoay điện thoại giữa trận** — bố cục là CSS, canvas là `Scale.FIT`. `BattleState`
  không biết gì về kích thước màn hình, nên không có gì để reset (US-01).

## 6. Chiến lược test

**Bốn tầng, và tầng 1 gánh phần lớn.**

**Tầng 1 · `core/` bằng Vitest, không trình duyệt.** Hàm thuần nên test là gọi hàm và
so state. Bao gồm:
- `path.at(s)` ở biên: `s = 0`, `s = length`, `s` vượt length, ngay tại điểm rẽ.
- RNG: cùng seed cho cùng chuỗi; hai seed khác cho chuỗi khác.
- Từng bước trong năm bước, cô lập.
- **Thứ tự năm bước**: một test dựng tình huống mà đảo bước 2↔3 cho kết quả khác,
  rồi khẳng định kết quả đúng. Đây là test bảo vệ `invariants.md` #1 — không có nó
  thì bất biến đó chỉ là một dòng văn.
- Sát thương và giáp: sàn 1, `pierceArmor`.
- Làm chậm: có thời hạn, **không cộng dồn** (FR-20).
- Đạn nổ lan khi mục tiêu chết trước khi đạn tới.
- Kinh tế: xây, nâng, bán, tiền rơi.
- Thắng và thua ở đúng điều kiện.

**Tầng 2 · `runBattle` headless (FR-31) và cân bằng (FR-32).**
- Xác định tính: cùng `(mapId, layout, upgrades, seed)` cho cùng kết quả.
- Độc lập phần cứng: chạy cùng seed với hai kích thước accumulator khác nhau, so
  state cuối (NFR-PERF-06).
- **Test chặn bản đồ bất khả thi:** với mỗi bản đồ, `referenceLayout` phải **thắng**
  ở `minUpgradesForMap(mapId)` — mức nâng cấp thấp nhất người chơi có thể có lúc bản
  đồ đó vừa mở. Đỏ ngay khi ai sửa một con số trong `data/` làm bản đồ thành không
  qua nổi. Đây là test quan trọng nhất trong dự án.
- Thời gian: một trận đầy đủ < 200ms (NFR-PERF-10).

**Tầng 3 · `storage/` bằng Vitest với `localStorage` giả.**
Sáu dạng dữ liệu rác, mỗi dạng một test: `null` · chuỗi không phải JSON · JSON là
mảng · object thiếu `schemaVersion` · `schemaVersion` là số lạ · trường `cores` là
chuỗi. Cả sáu phải cho ra profile mới **và** giữ được bản cũ dưới key `corrupt`.
Thêm một test cho ghi thất bại (`setItem` throw) mà game vẫn chạy.

**Tầng 4 · Playwright trên trình duyệt thật.**
- Đi hết US-01: mở → chơi → xây → gọi đợt → thắng.
- Bốn bề rộng 375 · 768 · 1024 · 1440, **cả hai chiều xoay** (FR-30) — chụp ảnh và
  khẳng định **không cuộn ngang**.
- Đi hết một lượt chỉ bằng bàn phím (NFR-A11Y-02), gồm cả đặt tháp.
- Đếm số lần React render trong 5 giây khi trận đang chạy, phải ≤ 50 (NFR-PERF-07).
- Đổi ngôn ngữ sang tiếng Việt rồi khẳng định không có phần tử nào tràn khỏi khung
  cha ở 375 (NFR-I18N-04).

**Không test:** giá trị cân bằng có "vui" không — đó là việc của người chơi, không
phải của assertion. Và không test hình ảnh pixel-by-pixel: sprite còn đang thay.

## 7. Thứ tự dựng — lát cắt dọc trước, bề rộng sau

Chi tiết từng task nằm ở `plan.md`. Nguyên tắc chọn thứ tự thì ở đây, vì nó là một
quyết định thiết kế:

Dựng **một bản đồ chơi được từ đầu tới cuối trên điện thoại** trước khi dựng bản đồ
thứ hai, trước cây nâng cấp, trước i18n. Lý do: `data/` đang là phỏng đoán và chỉ
biết nó sai ở đâu khi chơi thật. Dựng cả 5 bản đồ trước rồi mới chơi nghĩa là cân
bằng sai 5 lần thay vì 1.

Hệ quả: pha 1 kết thúc bằng một game **chơi được nhưng chỉ có một bản đồ, một ngôn
ngữ, không có tiến trình**. Đó là trạng thái đúng để dừng lại và chơi thử.
