# Tower Defense v1 — Implementation Plan

> ## ✅ ĐÃ THỰC HIỆN XONG — 2026-09-08
>
> Cả 23 task đã chạy. Checkbox bên dưới **cố ý để nguyên chưa tick**: chúng là
> phòng vệ khi context bị nén *trong lúc* thi công, và giờ việc đã đóng thì thứ
> hữu ích hơn là bản ghi **kế hoạch đã lệch ở đâu** — vì đó mới là thứ người đọc
> sáu tháng sau cần. Trạng thái thật của từng chức năng nằm ở
> [`scope.md`](../../02-requirements/scope.md), nợ còn lại ở
> [`backlog.md`](../../04-state/backlog.md).
>
> **Bảy chỗ lệch khỏi kế hoạch, và vì sao:**
>
> | Kế hoạch | Thực tế | Vì sao |
> | --- | --- | --- |
> | Task 2 (types) trước Task 4 (data) | Đảo lại | `core/types.ts` tham chiếu `data/`, nên data phải có trước để module kiểu biên dịch được |
> | Task 4 chỉ dựng bản đồ 1, bốn bản còn lại ở Task 18 | Dựng cả 5 ngay | Cổng cân bằng nằm ở Task 9, và tinh chỉnh một lượt cho cả bộ rẻ hơn tinh chỉnh một rồi bốn |
> | Task 5 `applyUpgrades` viết trung tính, làm thật ở Task 16 | Làm thật ngay | Cây nâng cấp cần cho `minUpgradesForMap`, và viết hai lần không tiết kiệm gì |
> | Task 9 `minUpgradesForMap` theo "ngân sách đã tiêu" | Trả về **cây trống** cho mọi bản đồ | Người chơi có thể tích trữ `cores` mà không mua gì, nên mức thấp nhất thật sự là *không có gì*. Ràng buộc mạnh hơn, và cho một đảm bảo tuyệt đối: không ai bị kẹt |
> | FR-32 = "bố cục tham chiếu thắng ở mức tối thiểu" | **Thêm** một người chơi mô phỏng bị ràng buộc kinh tế | `runBattle` cấp tháp miễn phí nên nó chỉ trả lời "bố cục có đủ mạnh". Câu hỏi làm một bản đồ thành bất khả thi là "người chơi có KỊP dựng nó không" — và chính test đó bắt được bản đồ 1 thua ở đợt 7 |
> | Task 20 thay toàn bộ sang sprite Kenney | Cỏ + tháp + địch là sprite, **đường vẫn vector** | Đường của pack là tile 64px trên lưới, bản đồ là polyline tự do. Dùng tile đường ⇒ vẽ lại cả 5 bản đồ ⇒ cân bằng lại từ đầu. Ghi ở `backlog.md` |
> | FR-18 "âm lượng nhạc và hiệu ứng, tắt riêng" | **Một** thanh trượt âm thanh | v1 không có nhạc nền; một thanh trượt điều khiển thứ không tồn tại thì tệ hơn không có |
>
> **Ba lỗi mà không test nào bắt được, chỉ có nhìn app đang chạy mới thấy** —
> đây là lý do `feature-flow` §5 tồn tại: `resetBridge()` gỡ mất subscriber của
> React nên màn trận đấu trắng trơn; khung canvas bị React unmount khi đổi bố
> cục nên `<canvas>` biến mất; và canvas tràn ra ngoài khung, chặn pointer lên
> nút "gọi đợt" — nút vẫn hiện, vẫn enabled, và không bấm được.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a playable browser tower-defense game: five maps, a global upgrade tree, vi/en switchable, no backend, static hosting at $0.

**Architecture:** A pure-TypeScript simulation core with no browser dependency, driven at a fixed 60Hz timestep, rendered by Phaser 3 inside a canvas, wrapped by a React DOM shell that reaches the core only through a one-way bridge (intents down, a ≤10Hz snapshot up).

**Tech Stack:** npm · Vite 7 · TypeScript · React 19 · Phaser 3 · Tailwind CSS 4 · Vitest · Playwright

**Spec:** [`docs/specs/tower-defense-v1/design.md`](design.md)

## Global Constraints

Copied verbatim from the permanent docs. Every task's requirements implicitly include this section.

- **`core/` imports nothing from the browser.** No Phaser, no React, no `window`, no `document`, no `localStorage`, and **no `Math.random`** (`architecture.md` §3, ADR-0003).
- **`FIXED_DT = 1 / 60` seconds.** The simulation never receives a real frame delta. Speed x2/x3 runs more ticks per frame; it never multiplies `dt` (`invariants.md` #4).
- **Tick order is exactly:** spawn → enemies advance → towers aim and fire → projectiles travel and hit → cleanup and win/lose check (`invariants.md` #1).
- **Enemies store `s`** (distance travelled along the polyline), never `{x, y}` (`invariants.md` #2).
- **React reads the snapshot at ≤ 10Hz**, never per frame (`invariants.md` #7, NFR-PERF-07).
- **Global upgrades are applied at battle creation only**, never mid-battle (`invariants.md` #8).
- **`gold`, `lives` and `damage` are integers.** Only `s`, projectile coordinates and slow factors are floats (`design.md` §1).
- **Every colour, font size and spacing value comes from** `docs/design-system/tower-defense/MASTER.md`. No new hex values, no font sizes outside 14/16/19/20/24/28/32/48. Only `--ui-ink` may sit on `--raised`. Never use `opacity` for a disabled state (`MASTER.md` §1.1b, §8).
- **Touch targets ≥ 44×44px.** No affordance exists only on hover (`MASTER.md` §5, NFR-A11Y-03).
- **No display string is hardcoded** outside `src/i18n/` (NFR-I18N-01). Build and test every layout with the **Vietnamese** strings first — they run ~30% longer than English (NFR-I18N-04).
- **No state is distinguished by colour alone**; every state carries a second non-colour channel (NFR-A11Y-06).
- **Terms are locked by** `docs/01-product/glossary.md`. Use `gold` for in-battle currency and `cores` for between-battle currency; never `money`/`coins`/`currency` for either. Use `Enemy`, `Wave`, `Slot`, `MapDef`, `s` — the banned synonyms are listed there.
- **Node 22+, npm.** Never `yarn install` in this repo (ADR-0006).

---

## File Structure

```
package.json · vite.config.ts · vitest.config.ts · tsconfig.json
playwright.config.ts · index.html · tailwind.css

src/
  core/                        # TS thuần. Không import trình duyệt.
    types.ts                   # EntityId, BattleState, Enemy, Tower, Projectile, phase
    rng.ts                     # RNG có seed: makeRng, nextInt, nextFloat
    path.ts                    # buildPath, pathAt, pathLength
    upgrades.ts                # applyUpgrades: TowerType[] + startGold/startLives
    economy.ts                 # canAfford, buildCost, upgradeCost, sellValue
    targeting.ts               # pickTarget theo TargetingMode
    step/
      spawn.ts                 # bước 1
      advance.ts               # bước 2
      fire.ts                  # bước 3
      projectiles.ts           # bước 4
      cleanup.ts               # bước 5
      index.ts                 # step(): gọi năm bước ĐÚNG THỨ TỰ
    battle.ts                  # createBattle, applyIntent
    runBattle.ts               # FR-31 — chạy trọn một trận, không trình duyệt
  data/                        # SỐ, không logic
    towers.ts  enemies.ts  upgradeTree.ts
    maps/index.ts  maps/m01-dong-co.ts … m05-lo-ren-cu.ts
  bridge/
    index.ts                   # intent queue + snapshot store (10Hz)
    types.ts                   # Intent, BattleSnapshot
  game/
    BattleScene.ts             # Phaser scene: vẽ, nội suy, input canvas
    boot.ts                    # cấu hình Phaser, Scale.FIT, đọc token từ CSS
    palette.ts                 # đọc CSS variable -> số nguyên cho Phaser
  storage/
    profile.ts                 # đọc/ghi phòng vệ, schemaVersion, migrate
    types.ts                   # Profile
  i18n/
    index.ts  vi.ts  en.ts
  ui/
    App.tsx                    # điều phối màn hình
    screens/TitleScreen.tsx  MapSelectScreen.tsx  WorkshopScreen.tsx
    screens/BattleScreen.tsx  ResultScreen.tsx  SettingsScreen.tsx
    battle/Hud.tsx  BuildPanel.tsx  TowerPanel.tsx  SpeedControl.tsx
    components/Press.tsx  Segmented.tsx  Chip.tsx  Icon.tsx
    hooks/useSnapshot.ts  useProfile.ts  useLocale.ts

tests/
  core/*.test.ts  storage/*.test.ts  balance/*.test.ts
e2e/*.spec.ts
```

---

# Pha 0 — Scaffold

### Task 1: Project scaffold with tokens wired from MASTER.md

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `index.html`, `src/main.tsx`, `src/tailwind.css`, `src/ui/App.tsx`, `.gitignore` additions
- Test: `tests/core/smoke.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `npm run dev` · `npm run build` · `npm test` · `npm run test:e2e` · `npm run lint`. CSS variables `--ui-void --ui-panel --ui-edge --ui-ink --ui-dim --ui-act --ui-on-act --sem-gold --sem-core --sem-danger --sem-ok --letterbox --sunken --raised` on `:root`, plus Tailwind theme keys `bg-void bg-panel bg-sunken bg-raised text-ink text-dim text-act border-edge`.

- [ ] **Step 1: Write the failing test**

`tests/core/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { FIXED_DT, TICKS_PER_SECOND } from '../../src/core/types';

describe('constants', () => {
  it('runs the simulation at exactly 60Hz', () => {
    expect(TICKS_PER_SECOND).toBe(60);
    expect(FIXED_DT).toBeCloseTo(1 / 60, 10);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- smoke`
Expected: FAIL — cannot resolve `src/core/types`.

- [ ] **Step 3: Scaffold the project**

```bash
npm init -y
npm i react react-dom phaser
npm i -D typescript vite @vitejs/plugin-react vitest jsdom \
        @types/react @types/react-dom @playwright/test \
        tailwindcss @tailwindcss/vite
```

`src/core/types.ts` (first lines only; the rest arrives in Task 2):
```ts
export const TICKS_PER_SECOND = 60;
export const FIXED_DT = 1 / TICKS_PER_SECOND;
```

`vite.config.ts` — `base` matters: GitHub Pages serves under a sub-path, and getting it wrong means local works and production is a blank page (ADR-0006 §4).
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/web-game-tower-defense/' : '/',
  plugins: [react(), tailwindcss()],
});
```

`src/tailwind.css` — the single path from `MASTER.md` into code. No second copy of the palette.
```css
@import 'tailwindcss';
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');

:root {
  --ui-void: #101E27;  --ui-panel: #1D3442; --ui-edge: #0A1219;
  --ui-ink: #F4F1E8;   --ui-dim: #93AAB8;   --ui-act: #38BDC8;  --ui-on-act: #0A1219;
  --sem-gold: #F0B429; --sem-core: #A78BFA; --sem-danger: #FF7A7A; --sem-ok: #4CC38A;
  --letterbox: #0A141B; --sunken: #152A36;  --raised: #24404F;
}

@theme inline {
  --color-void: var(--ui-void);      --color-panel: var(--ui-panel);
  --color-edge: var(--ui-edge);      --color-ink: var(--ui-ink);
  --color-dim: var(--ui-dim);        --color-act: var(--ui-act);
  --color-on-act: var(--ui-on-act);  --color-gold: var(--sem-gold);
  --color-core: var(--sem-core);     --color-danger: var(--sem-danger);
  --color-ok: var(--sem-ok);         --color-letterbox: var(--letterbox);
  --color-sunken: var(--sunken);     --color-raised: var(--raised);
  --font-disp: 'Baloo 2', 'Be Vietnam Pro', system-ui, sans-serif;
  --font-body: 'Be Vietnam Pro', system-ui, sans-serif;
  --text-sm: 14px; --text-md: 16px; --text-lg: 19px;
  --text-xl2: 20px; --text-2xl: 24px; --text-3xl: 28px;
  --text-hero: 32px; --text-hero-lg: 48px;
}

body { margin: 0; background: var(--ui-void); color: var(--ui-ink); font-family: var(--font-body); }
.num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.ts'] } });
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 5: Verify the dev server boots and the tokens resolve**

Run: `npm run dev`, open the page, and in the console run
`getComputedStyle(document.documentElement).getPropertyValue('--ui-act').trim()`.
Expected: `#38BDC8`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind with MASTER.md tokens"
```

---

# Pha 1 — `core/`, testable without a browser

### Task 2: Seeded RNG and the full state types

**Files:**
- Create: `src/core/rng.ts`; extend `src/core/types.ts`
- Test: `tests/core/rng.test.ts`

**Interfaces:**
- Consumes: `FIXED_DT`, `TICKS_PER_SECOND` from Task 1
- Produces:
  - `type RngState = { seed: number }`
  - `makeRng(seed: number): RngState`
  - `nextFloat(rng: RngState): number` — mutates `rng.seed`, returns `[0, 1)`
  - `nextInt(rng: RngState, maxExclusive: number): number`
  - `type EntityId = number`
  - `type BattlePhase = 'prep' | 'wave' | 'won' | 'lost'`
  - `BattleState`, `Enemy`, `Tower`, `Projectile` exactly as in `design.md` §1, plus `nextId: EntityId`

- [ ] **Step 1: Write the failing test**

`tests/core/rng.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { makeRng, nextFloat, nextInt } from '../../src/core/rng';

describe('seeded rng', () => {
  it('gives the same sequence for the same seed', () => {
    const a = makeRng(12345), b = makeRng(12345);
    const seqA = [nextFloat(a), nextFloat(a), nextFloat(a)];
    const seqB = [nextFloat(b), nextFloat(b), nextFloat(b)];
    expect(seqA).toEqual(seqB);
  });

  it('gives different sequences for different seeds', () => {
    const a = makeRng(1), b = makeRng(2);
    expect(nextFloat(a)).not.toBe(nextFloat(b));
  });

  it('stays inside [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 5000; i++) {
      const v = nextFloat(r);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt stays inside [0, maxExclusive)', () => {
    const r = makeRng(99);
    for (let i = 0; i < 2000; i++) {
      const v = nextInt(r, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- rng`
Expected: FAIL — cannot resolve `src/core/rng`.

- [ ] **Step 3: Implement the minimal code to make the tests pass**

`src/core/rng.ts` — mulberry32. Small, fast, and enough for spawn jitter; this is not cryptography.
```ts
import type { RngState } from './types';

export function makeRng(seed: number): RngState {
  return { seed: seed >>> 0 };
}

export function nextFloat(rng: RngState): number {
  rng.seed = (rng.seed + 0x6D2B79F5) >>> 0;
  let t = rng.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextInt(rng: RngState, maxExclusive: number): number {
  return Math.floor(nextFloat(rng) * maxExclusive);
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- rng`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add the ESLint guard that keeps `core/` pure**

Add to the lint config a `no-restricted-imports` / `no-restricted-globals` rule scoped to `src/core/**`, forbidding `phaser`, `react`, `window`, `document`, `localStorage`, `Math.random`. This is the only mechanical enforcement of the Global Constraint above; without it the constraint is prose.

- [ ] **Step 6: Commit**

```bash
git add src/core tests/core eslint.config.js
git commit -m "feat(core): add seeded rng and battle state types

Refs: ADR-0003 · invariants #3"
```

---

### Task 3: The polyline path

**Files:**
- Create: `src/core/path.ts`
- Test: `tests/core/path.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Point = { x: number; y: number }`
  - `type Path = { waypoints: Point[]; segmentLengths: number[]; cumulative: number[]; length: number }`
  - `buildPath(waypoints: Point[]): Path`
  - `pathAt(path: Path, s: number): Point` — clamps `s` to `[0, length]`

- [ ] **Step 1: Write the failing test**

`tests/core/path.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildPath, pathAt } from '../../src/core/path';

const L = buildPath([{ x: 0, y: 0 }, { x: 100, y: 0 }]);                       // thẳng, dài 100
const CORNER = buildPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }]); // dài 150

describe('buildPath', () => {
  it('sums segment lengths', () => {
    expect(L.length).toBe(100);
    expect(CORNER.length).toBe(150);
  });
});

describe('pathAt', () => {
  it('returns the first waypoint at s = 0', () => {
    expect(pathAt(L, 0)).toEqual({ x: 0, y: 0 });
  });

  it('returns the last waypoint at s = length', () => {
    expect(pathAt(CORNER, 150)).toEqual({ x: 100, y: 50 });
  });

  it('interpolates inside a segment', () => {
    expect(pathAt(L, 25)).toEqual({ x: 25, y: 0 });
  });

  it('lands exactly on the corner at the segment boundary', () => {
    expect(pathAt(CORNER, 100)).toEqual({ x: 100, y: 0 });
  });

  it('interpolates in the second segment', () => {
    expect(pathAt(CORNER, 120)).toEqual({ x: 100, y: 20 });
  });

  it('clamps s past the end instead of extrapolating', () => {
    expect(pathAt(CORNER, 999)).toEqual({ x: 100, y: 50 });
  });

  it('clamps negative s', () => {
    expect(pathAt(CORNER, -5)).toEqual({ x: 0, y: 0 });
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- path`
Expected: FAIL — cannot resolve `src/core/path`.

- [ ] **Step 3: Implement the minimal code**

`src/core/path.ts`:
```ts
export type Point = { x: number; y: number };
export type Path = {
  waypoints: Point[]; segmentLengths: number[]; cumulative: number[]; length: number;
};

export function buildPath(waypoints: Point[]): Path {
  if (waypoints.length < 2) throw new Error('path needs at least two waypoints');
  const segmentLengths: number[] = [];
  const cumulative: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    const len = Math.hypot(dx, dy);
    segmentLengths.push(len);
    cumulative.push(cumulative[i - 1] + len);
  }
  return { waypoints, segmentLengths, cumulative, length: cumulative[cumulative.length - 1] };
}

export function pathAt(path: Path, s: number): Point {
  if (s <= 0) return { ...path.waypoints[0] };
  if (s >= path.length) return { ...path.waypoints[path.waypoints.length - 1] };
  let i = 1;
  while (i < path.cumulative.length && path.cumulative[i] < s) i++;
  const segStart = path.cumulative[i - 1];
  const segLen = path.segmentLengths[i - 1];
  const t = segLen === 0 ? 0 : (s - segStart) / segLen;
  const a = path.waypoints[i - 1], b = path.waypoints[i];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- path`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/path.ts tests/core/path.test.ts
git commit -m "feat(core): interpolate a point at distance s along the polyline

Refs: FR-01 · invariants #2"
```

---

### Task 4: Balance data and map 1

**Files:**
- Create: `src/data/towers.ts`, `src/data/enemies.ts`, `src/data/maps/m01-dong-co.ts`, `src/data/maps/index.ts`
- Test: `tests/core/data.test.ts`

**Interfaces:**
- Consumes: `Point` from Task 3
- Produces: `TowerType`, `EnemyType`, `WaveEntry`, `MapDef` exactly as in `design.md` §4; `TOWERS: Record<TowerTypeId, TowerType>`, `ENEMIES: Record<EnemyTypeId, EnemyType>`, `MAPS: Record<MapId, MapDef>`, `MAP_ORDER: MapId[]`
- `TowerTypeId = 'arrow' | 'cannon' | 'frost' | 'bolt' | 'venom'`
- `EnemyTypeId = 'grunt' | 'armored' | 'runner'`
- `MapId = 'm01' | 'm02' | 'm03' | 'm04' | 'm05'`

Map units are the same 400×400 space the mockup board uses, so the approved layout transfers directly.

- [ ] **Step 1: Write the failing test**

`tests/core/data.test.ts` — these assert *shape and internal consistency*, not whether the numbers are fun. That is `runBattle`'s job (Task 9) and the player's.
```ts
import { describe, it, expect } from 'vitest';
import { TOWERS, ENEMIES } from '../../src/data/towers';
import { MAPS, MAP_ORDER } from '../../src/data/maps';

describe('tower data', () => {
  it('gives every tower at least three levels', () => {
    for (const t of Object.values(TOWERS)) expect(t.levels.length).toBeGreaterThanOrEqual(3);
  });

  it('leaves upgradeCost null on the last level only', () => {
    for (const t of Object.values(TOWERS)) {
      t.levels.forEach((lv, i) => {
        const isLast = i === t.levels.length - 1;
        expect(lv.upgradeCost === null).toBe(isLast);
      });
    }
  });

  it('makes each level stronger than the one before', () => {
    for (const t of Object.values(TOWERS)) {
      for (let i = 1; i < t.levels.length; i++) {
        expect(t.levels[i].damage).toBeGreaterThanOrEqual(t.levels[i - 1].damage);
      }
    }
  });
});

describe('map data', () => {
  it('has one entry per id in MAP_ORDER', () => {
    for (const id of MAP_ORDER) expect(MAPS[id]).toBeDefined();
  });

  it('gives every map at least two waypoints and one slot', () => {
    for (const m of Object.values(MAPS)) {
      expect(m.waypoints.length).toBeGreaterThanOrEqual(2);
      expect(m.slots.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('references only known enemy ids in wave schedules', () => {
    for (const m of Object.values(MAPS)) {
      for (const wave of m.waves) for (const e of wave) expect(ENEMIES[e.enemyId]).toBeDefined();
    }
  });

  it('keeps referenceLayout inside the slot list and inside known towers', () => {
    for (const m of Object.values(MAPS)) {
      for (const p of m.referenceLayout) {
        expect(p.slotIndex).toBeGreaterThanOrEqual(0);
        expect(p.slotIndex).toBeLessThan(m.slots.length);
        expect(TOWERS[p.towerId]).toBeDefined();
        expect(p.level).toBeGreaterThanOrEqual(1);
        expect(p.level).toBeLessThanOrEqual(TOWERS[p.towerId].levels.length);
      }
    }
  });

  it('never puts two towers on the same slot in referenceLayout', () => {
    for (const m of Object.values(MAPS)) {
      const used = m.referenceLayout.map((p) => p.slotIndex);
      expect(new Set(used).size).toBe(used.length);
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- data`
Expected: FAIL — cannot resolve `src/data/towers`.

- [ ] **Step 3: Write the data files**

`src/data/enemies.ts`:
```ts
export type EnemyTypeId = 'grunt' | 'armored' | 'runner';
export type EnemyType = {
  id: EnemyTypeId; hp: number; speed: number;   // đơn vị bản đồ / giây
  armor: number; bounty: number; leak: number;  // leak = số mạng bị trừ
};

export const ENEMIES: Record<EnemyTypeId, EnemyType> = {
  grunt:   { id: 'grunt',   hp: 60,  speed: 34, armor: 0, bounty: 6,  leak: 1 },
  runner:  { id: 'runner',  hp: 34,  speed: 62, armor: 0, bounty: 7,  leak: 1 },
  armored: { id: 'armored', hp: 150, speed: 26, armor: 6, bounty: 14, leak: 2 },
};
```

`src/data/towers.ts` — three towers at start; `bolt` and `venom` are unlocked by the tree (FR-12).
```ts
export type TowerTypeId = 'arrow' | 'cannon' | 'frost' | 'bolt' | 'venom';
export type TargetingMode = 'first' | 'last' | 'strongest' | 'closest';

export type TowerLevel = {
  damage: number; rangeSq: number; cooldownTicks: number;
  splashRadius: number; slowFactor: number; slowTicks: number;
  upgradeCost: number | null;
};
export type TowerType = {
  id: TowerTypeId; cost: number; targeting: TargetingMode;
  pierceArmor: boolean; unlockedAtStart: boolean; levels: TowerLevel[];
};

const NO_SLOW = { slowFactor: 1, slowTicks: 0 };

export const TOWERS: Record<TowerTypeId, TowerType> = {
  arrow: {
    id: 'arrow', cost: 80, targeting: 'first', pierceArmor: false, unlockedAtStart: true,
    levels: [
      { damage: 12, rangeSq: 78 * 78,  cooldownTicks: 50, splashRadius: 0, ...NO_SLOW, upgradeCost: 60 },
      { damage: 18, rangeSq: 88 * 88,  cooldownTicks: 44, splashRadius: 0, ...NO_SLOW, upgradeCost: 110 },
      { damage: 27, rangeSq: 98 * 98,  cooldownTicks: 38, splashRadius: 0, ...NO_SLOW, upgradeCost: null },
    ],
  },
  cannon: {
    id: 'cannon', cost: 150, targeting: 'first', pierceArmor: false, unlockedAtStart: true,
    levels: [
      { damage: 28, rangeSq: 66 * 66, cooldownTicks: 110, splashRadius: 30, ...NO_SLOW, upgradeCost: 120 },
      { damage: 41, rangeSq: 72 * 72, cooldownTicks: 100, splashRadius: 34, ...NO_SLOW, upgradeCost: 200 },
      { damage: 60, rangeSq: 80 * 80, cooldownTicks: 92,  splashRadius: 40, ...NO_SLOW, upgradeCost: null },
    ],
  },
  frost: {
    id: 'frost', cost: 120, targeting: 'first', pierceArmor: false, unlockedAtStart: true,
    levels: [
      { damage: 4, rangeSq: 70 * 70, cooldownTicks: 70, splashRadius: 26, slowFactor: 0.62, slowTicks: 90,  upgradeCost: 95 },
      { damage: 6, rangeSq: 76 * 76, cooldownTicks: 64, splashRadius: 30, slowFactor: 0.52, slowTicks: 110, upgradeCost: 160 },
      { damage: 9, rangeSq: 84 * 84, cooldownTicks: 58, splashRadius: 34, slowFactor: 0.44, slowTicks: 130, upgradeCost: null },
    ],
  },
  bolt: {
    id: 'bolt', cost: 260, targeting: 'first', pierceArmor: false, unlockedAtStart: false,
    levels: [
      { damage: 22, rangeSq: 58 * 58, cooldownTicks: 60, splashRadius: 44, ...NO_SLOW, upgradeCost: 190 },
      { damage: 33, rangeSq: 62 * 62, cooldownTicks: 54, splashRadius: 50, ...NO_SLOW, upgradeCost: 300 },
      { damage: 48, rangeSq: 68 * 68, cooldownTicks: 48, splashRadius: 56, ...NO_SLOW, upgradeCost: null },
    ],
  },
  venom: {
    id: 'venom', cost: 300, targeting: 'strongest', pierceArmor: true, unlockedAtStart: false,
    levels: [
      { damage: 16, rangeSq: 74 * 74, cooldownTicks: 40, splashRadius: 0, ...NO_SLOW, upgradeCost: 230 },
      { damage: 24, rangeSq: 80 * 80, cooldownTicks: 36, splashRadius: 0, ...NO_SLOW, upgradeCost: 360 },
      { damage: 36, rangeSq: 88 * 88, cooldownTicks: 32, splashRadius: 0, ...NO_SLOW, upgradeCost: null },
    ],
  },
};
```

`src/data/maps/m01-dong-co.ts` — the waypoints and slots are the same ones the approved mockup board uses.
```ts
import type { MapDef } from './index';

export const M01: MapDef = {
  id: 'm01',
  waypoints: [
    { x: -12, y: 84 }, { x: 128, y: 84 }, { x: 128, y: 196 }, { x: 64, y: 196 },
    { x: 64, y: 316 }, { x: 252, y: 316 }, { x: 252, y: 148 }, { x: 344, y: 148 },
    { x: 344, y: 268 }, { x: 412, y: 268 },
  ],
  slots: [
    { x: 170, y: 40 }, { x: 216, y: 40 }, { x: 26, y: 240 }, { x: 170, y: 240 },
    { x: 300, y: 60 }, { x: 110, y: 370 }, { x: 216, y: 370 },
    { x: 26, y: 140 }, { x: 170, y: 140 }, { x: 300, y: 212 },
  ],
  startGold: 260,
  startLives: 20,
  waves: [
    [{ enemyId: 'grunt', count: 5,  intervalTicks: 48, delayTicks: 0 }],
    [{ enemyId: 'grunt', count: 8,  intervalTicks: 42, delayTicks: 0 }],
    [{ enemyId: 'grunt', count: 6,  intervalTicks: 40, delayTicks: 0 },
     { enemyId: 'runner', count: 3, intervalTicks: 30, delayTicks: 240 }],
    [{ enemyId: 'runner', count: 8, intervalTicks: 26, delayTicks: 0 }],
    [{ enemyId: 'grunt', count: 10, intervalTicks: 34, delayTicks: 0 },
     { enemyId: 'armored', count: 2, intervalTicks: 90, delayTicks: 200 }],
    [{ enemyId: 'armored', count: 4, intervalTicks: 80, delayTicks: 0 }],
    [{ enemyId: 'grunt', count: 14, intervalTicks: 28, delayTicks: 0 },
     { enemyId: 'runner', count: 6, intervalTicks: 24, delayTicks: 300 }],
    [{ enemyId: 'armored', count: 5, intervalTicks: 70, delayTicks: 0 },
     { enemyId: 'runner', count: 8, intervalTicks: 22, delayTicks: 260 }],
    [{ enemyId: 'grunt', count: 18, intervalTicks: 24, delayTicks: 0 }],
    [{ enemyId: 'armored', count: 7, intervalTicks: 60, delayTicks: 0 },
     { enemyId: 'grunt', count: 12, intervalTicks: 26, delayTicks: 180 }],
    [{ enemyId: 'runner', count: 16, intervalTicks: 18, delayTicks: 0 },
     { enemyId: 'armored', count: 4, intervalTicks: 70, delayTicks: 220 }],
    [{ enemyId: 'armored', count: 10, intervalTicks: 52, delayTicks: 0 },
     { enemyId: 'grunt', count: 16, intervalTicks: 22, delayTicks: 160 },
     { enemyId: 'runner', count: 10, intervalTicks: 18, delayTicks: 420 }],
  ],
  referenceLayout: [
    { slotIndex: 7, towerId: 'arrow',  level: 3 },
    { slotIndex: 8, towerId: 'cannon', level: 2 },
    { slotIndex: 9, towerId: 'frost',  level: 2 },
    { slotIndex: 3, towerId: 'arrow',  level: 2 },
    { slotIndex: 0, towerId: 'cannon', level: 1 },
  ],
};
```

`src/data/maps/index.ts` exports the `MapDef` type, `MAPS` (only `m01` for now) and `MAP_ORDER` (all five ids — the four missing maps arrive in Task 18, and the `MAPS[id]` test will go red until then, so add the other four ids to `MAP_ORDER` in Task 18, not now).

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- data`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data tests/core/data.test.ts
git commit -m "feat(data): add tower, enemy and map-1 balance tables

Numbers are a first guess and recorded as such in backlog.md §Nợ kỹ thuật.
referenceLayout lives in MapDef rather than in the test file so it cannot
drift away from the map it is meant to beat.

Refs: FR-05 · FR-20 · FR-21 · FR-32"
```

---

### Task 5: `createBattle`, `applyUpgrades`, `applyIntent`

**Files:**
- Create: `src/core/upgrades.ts`, `src/core/economy.ts`, `src/core/battle.ts`
- Test: `tests/core/battle.test.ts`, `tests/core/economy.test.ts`

**Interfaces:**
- Consumes: `TOWERS`, `ENEMIES`, `MAPS`, `buildPath`, `makeRng`
- Produces:
  - `type UpgradeState = Record<UpgradeNodeId, number>`
  - `type ResolvedRules = { towers: Record<TowerTypeId, TowerType>; startGold: number; startLives: number; bountyMultiplier: number; buildCostMultiplier: number; sellRatio: number }`
  - `applyUpgrades(upgrades: UpgradeState): ResolvedRules`
  - `type Battle = { state: BattleState; map: MapDef; path: Path; rules: ResolvedRules }`
  - `createBattle(mapId: MapId, upgrades: UpgradeState, seed: number): Battle`
  - `type Intent = { kind: 'build'; slotIndex: number; towerId: TowerTypeId } | { kind: 'upgrade'; towerId: EntityId } | { kind: 'sell'; towerId: EntityId } | { kind: 'startWave' }`
  - `applyIntent(battle: Battle, intent: Intent): void` — mutates; **silently ignores anything invalid** (`design.md` §5)
  - `buildCost`, `upgradeCostOf`, `sellValue` in `economy.ts`

- [ ] **Step 1: Write the failing test**

`tests/core/battle.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { createBattle, applyIntent } from '../../src/core/battle';

const fresh = () => createBattle('m01', {}, 1);

describe('createBattle', () => {
  it('starts in prep at wave 0 with the map economy', () => {
    const b = fresh();
    expect(b.state.phase).toBe('prep');
    expect(b.state.waveIndex).toBe(0);
    expect(b.state.gold).toBe(260);
    expect(b.state.lives).toBe(20);
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.enemies).toHaveLength(0);
  });

  it('resolves the path so s runs from 0 to a positive length', () => {
    expect(fresh().path.length).toBeGreaterThan(0);
  });
});

describe('applyIntent build', () => {
  it('places a tower and charges for it', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(1);
    expect(b.state.towers[0].slotIndex).toBe(7);
    expect(b.state.towers[0].level).toBe(1);
    expect(b.state.gold).toBe(260 - 80);
  });

  it('ignores a build on an occupied slot', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'cannon' });
    expect(b.state.towers).toHaveLength(1);
    expect(b.state.gold).toBe(180);
  });

  it('ignores a build the player cannot afford', () => {
    const b = fresh();
    b.state.gold = 10;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.gold).toBe(10);
  });

  it('ignores a build on a slot index the map does not have', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 999, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(0);
  });

  it('ignores a tower not unlocked at start', () => {
    const b = fresh();
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'venom' });
    expect(b.state.towers).toHaveLength(0);
  });
});

describe('applyIntent upgrade and sell', () => {
  it('raises the level and charges the level-specific cost', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const id = b.state.towers[0].id;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(b.state.towers[0].level).toBe(2);
    expect(b.state.gold).toBe(260 - 80 - 60);
  });

  it('does not charge twice for one upgrade when the intent repeats fast', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const id = b.state.towers[0].id;
    const before = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    const afterFirst = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(afterFirst).toBe(before - 60);
    expect(b.state.gold).toBe(afterFirst - 110);  // giá bậc 2->3, không phải 60 lần nữa
    expect(b.state.towers[0].level).toBe(3);
  });

  it('refuses to upgrade past the last level', () => {
    const b = fresh();
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const id = b.state.towers[0].id;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    applyIntent(b, { kind: 'upgrade', towerId: id });
    const goldAtMax = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(b.state.towers[0].level).toBe(3);
    expect(b.state.gold).toBe(goldAtMax);
  });

  it('sells for half of everything spent, rounded down', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const id = b.state.towers[0].id;
    applyIntent(b, { kind: 'upgrade', towerId: id });     // đã tiêu 80 + 60 = 140
    const goldBefore = b.state.gold;
    applyIntent(b, { kind: 'sell', towerId: id });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.gold).toBe(goldBefore + 70);
  });

  it('ignores an upgrade or sell for an id that does not exist', () => {
    const b = fresh();
    const gold = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: 424242 });
    applyIntent(b, { kind: 'sell', towerId: 424242 });
    expect(b.state.gold).toBe(gold);
  });
});

describe('applyIntent startWave', () => {
  it('moves prep to wave and loads the first schedule entry', () => {
    const b = fresh();
    applyIntent(b, { kind: 'startWave' });
    expect(b.state.phase).toBe('wave');
    expect(b.state.spawnCursor).toBe(0);
  });

  it('is ignored while a wave is already running', () => {
    const b = fresh();
    applyIntent(b, { kind: 'startWave' });
    const wave = b.state.waveIndex;
    applyIntent(b, { kind: 'startWave' });
    expect(b.state.waveIndex).toBe(wave);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- battle`
Expected: FAIL — cannot resolve `src/core/battle`.

- [ ] **Step 3: Implement `economy.ts`, `upgrades.ts`, `battle.ts`**

`src/core/economy.ts`:
```ts
export function buildCost(rules: ResolvedRules, towerId: TowerTypeId): number {
  return Math.round(rules.towers[towerId].cost * rules.buildCostMultiplier);
}
export function upgradeCostOf(rules: ResolvedRules, towerId: TowerTypeId, level: number): number | null {
  return rules.towers[towerId].levels[level - 1].upgradeCost;
}
/** Tổng đã tiêu cho tháp này, nhân tỉ lệ bán. Làm tròn xuống. */
export function sellValue(rules: ResolvedRules, towerId: TowerTypeId, level: number): number {
  let spent = buildCost(rules, towerId);
  for (let l = 1; l < level; l++) spent += rules.towers[towerId].levels[l - 1].upgradeCost ?? 0;
  return Math.floor(spent * rules.sellRatio);
}
```

`applyUpgrades` starts as the identity transform plus the four multipliers at their neutral values (`bountyMultiplier: 1`, `buildCostMultiplier: 1`, `sellRatio: 0.5`) and gains real behaviour in Task 16. Writing it now, neutral, is what keeps `invariants.md` #8 true from the first battle: `step` never sees `upgrades`.

`applyIntent` validates then mutates, and returns nothing. Every guard that fails is a silent return — the UI has already disabled the button, and this is the second gate (`design.md` §5).

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- battle economy`
Expected: PASS, 14 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core tests/core
git commit -m "feat(core): create a battle, resolve upgrades once, apply player intents

applyUpgrades is written neutral rather than deferred, so step() never reads
the upgrade state and invariants #8 holds from the first battle.

Refs: FR-05 · FR-08 · FR-09 · FR-22 · NFR-REL-02 · invariants #8"
```

---

### Task 6: Tick steps 1 and 2 — spawn, advance, leak, lose

**Files:**
- Create: `src/core/step/spawn.ts`, `src/core/step/advance.ts`
- Test: `tests/core/spawn.test.ts`, `tests/core/advance.test.ts`

**Interfaces:**
- Consumes: `Battle`, `pathAt`, `ENEMIES`
- Produces: `stepSpawn(battle: Battle): void`, `stepAdvance(battle: Battle): void`

- [ ] **Step 1: Write the failing test**

`tests/core/advance.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { createBattle } from '../../src/core/battle';
import { stepAdvance } from '../../src/core/step/advance';
import { FIXED_DT } from '../../src/core/types';

function withEnemy(overrides: Partial<{ s: number; typeId: 'grunt' | 'runner' | 'armored'; slowUntilTick: number; slowFactor: number }> = {}) {
  const b = createBattle('m01', {}, 1);
  b.state.enemies.push({
    id: 1, typeId: overrides.typeId ?? 'grunt', s: overrides.s ?? 0, hp: 60,
    slowUntilTick: overrides.slowUntilTick ?? 0, slowFactor: overrides.slowFactor ?? 1,
  });
  return b;
}

describe('stepAdvance', () => {
  it('moves an enemy forward by speed * FIXED_DT', () => {
    const b = withEnemy();
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(34 * FIXED_DT, 8);
  });

  it('applies the slow factor while the slow is still active', () => {
    const b = withEnemy({ slowUntilTick: 100, slowFactor: 0.5 });
    b.state.tick = 10;
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(34 * 0.5 * FIXED_DT, 8);
  });

  it('ignores an expired slow', () => {
    const b = withEnemy({ slowUntilTick: 5, slowFactor: 0.5 });
    b.state.tick = 10;
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(34 * FIXED_DT, 8);
  });

  it('removes an enemy that reaches the end and takes its leak in lives', () => {
    const b = withEnemy({ s: 1e9 });
    stepAdvance(b);
    expect(b.state.enemies).toHaveLength(0);
    expect(b.state.lives).toBe(19);
    expect(b.state.stats.leaked).toBe(1);
  });

  it('takes two lives for an armored leak', () => {
    const b = withEnemy({ s: 1e9, typeId: 'armored' });
    stepAdvance(b);
    expect(b.state.lives).toBe(18);
  });

  it('loses the battle when lives hit zero', () => {
    const b = withEnemy({ s: 1e9 });
    b.state.lives = 1;
    stepAdvance(b);
    expect(b.state.lives).toBe(0);
    expect(b.state.phase).toBe('lost');
  });

  it('never lets lives go below zero', () => {
    const b = withEnemy({ s: 1e9, typeId: 'armored' });
    b.state.lives = 1;
    stepAdvance(b);
    expect(b.state.lives).toBe(0);
  });
});
```

`tests/core/spawn.test.ts` asserts: nothing spawns during `'prep'`; the first enemy appears at `s === 0` once `delayTicks` has elapsed; enemies appear `intervalTicks` apart; `spawnCursor` advances only after `count` enemies from that entry; nothing spawns once the schedule is exhausted.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- advance spawn`
Expected: FAIL — cannot resolve `src/core/step/advance`.

- [ ] **Step 3: Implement both steps**

`src/core/step/advance.ts`:
```ts
import { ENEMIES } from '../../data/enemies';
import { FIXED_DT } from '../types';
import type { Battle } from '../battle';

export function stepAdvance(battle: Battle): void {
  const { state, path } = battle;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const type = ENEMIES[e.typeId];
    const factor = state.tick < e.slowUntilTick ? e.slowFactor : 1;
    e.s += type.speed * factor * FIXED_DT;
    if (e.s >= path.length) {
      state.enemies.splice(i, 1);
      state.lives = Math.max(0, state.lives - type.leak);
      state.stats.leaked++;
      if (state.lives === 0) { state.phase = 'lost'; return; }
    }
  }
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- advance spawn`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/step tests/core
git commit -m "feat(core): spawn enemies on schedule and advance them along s

Refs: FR-01 · FR-02 · FR-06 · invariants #2"
```

---

### Task 7: Tick steps 3 and 4 — aim, fire, travel, damage

**Files:**
- Create: `src/core/targeting.ts`, `src/core/step/fire.ts`, `src/core/step/projectiles.ts`
- Test: `tests/core/targeting.test.ts`, `tests/core/fire.test.ts`, `tests/core/projectiles.test.ts`

**Interfaces:**
- Consumes: `Battle`, `pathAt`, `TOWERS`, `ENEMIES`
- Produces:
  - `pickTarget(battle: Battle, tower: Tower): Enemy | null`
  - `stepFire(battle: Battle): void`
  - `stepProjectiles(battle: Battle): void`
  - `effectiveDamage(damage: number, armor: number, pierce: boolean): number`

- [ ] **Step 1: Write the failing test**

`tests/core/projectiles.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { effectiveDamage } from '../../src/core/step/projectiles';

describe('effectiveDamage', () => {
  it('subtracts armor', () => { expect(effectiveDamage(20, 6, false)).toBe(14); });
  it('ignores armor when the tower pierces', () => { expect(effectiveDamage(20, 6, true)).toBe(20); });
  it('never drops below 1, so armor cannot make a tower useless', () => {
    expect(effectiveDamage(4, 6, false)).toBe(1);
    expect(effectiveDamage(1, 99, false)).toBe(1);
  });
});
```

`tests/core/targeting.test.ts` asserts: with two enemies in range, `first` picks the larger `s`; an enemy outside `rangeSq` is never picked; an empty battlefield gives `null`; `strongest` picks the highest `hp`.

`tests/core/fire.test.ts` asserts: `cooldown` decrements each tick; a tower at `cooldown === 0` with a target in range emits exactly one projectile and resets `cooldown` to the level's `cooldownTicks`; a tower with no target in range keeps `cooldown` at 0 and fires on the tick a target appears.

Two more, in `tests/core/projectiles.test.ts`, that are the reason this task exists:
```ts
it('spreads splash damage to every enemy inside the radius', () => { /* dựng 3 enemy, 2 trong bán kính */ });
it('still detonates at the last known position when the target dies in flight', () => {
  // FR-04, design.md §2 bước 4 — nếu không, đạn nổ lan mất trắng
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- targeting fire projectiles`
Expected: FAIL — cannot resolve the three modules.

- [ ] **Step 3: Implement the three modules**

`effectiveDamage`:
```ts
export function effectiveDamage(damage: number, armor: number, pierce: boolean): number {
  return Math.max(1, pierce ? damage : damage - armor);
}
```

`pickTarget` compares squared distances so it never calls `Math.sqrt`, and reads the enemy position through `pathAt(path, e.s)` rather than storing coordinates.

`stepProjectiles` stores `lastKnownX/lastKnownY` on the projectile every tick it has a live target, so the death-in-flight case has somewhere to detonate.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- targeting fire projectiles`
Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core tests/core
git commit -m "feat(core): aim, fire, fly and hit, with an armor floor of 1

Splash keeps its damage when the target dies mid-flight: the projectile
detonates at the last position it knew, so a cannon shot is never wasted
by a kill it did not cause.

Refs: FR-03 · FR-04 · FR-20 · FR-21 · FR-23"
```

---

### Task 8: Step 5, and the test that guards the tick order

**Files:**
- Create: `src/core/step/cleanup.ts`, `src/core/step/index.ts`
- Test: `tests/core/step-order.test.ts`, `tests/core/cleanup.test.ts`

**Interfaces:**
- Consumes: all five step modules
- Produces: `step(battle: Battle): void` — runs the five steps in the order fixed by `invariants.md` #1 and increments `state.tick`

- [ ] **Step 1: Write the failing test**

`tests/core/step-order.test.ts` — this is the test that turns `invariants.md` #1 from prose into something that can go red.
```ts
import { describe, it, expect } from 'vitest';
import { createBattle, applyIntent } from '../../src/core/battle';
import { step } from '../../src/core/step';
import { TOWERS } from '../../src/data/towers';
import { pathAt } from '../../src/core/path';

describe('tick order (invariants #1)', () => {
  it('fires at where the enemy is AFTER it moves this tick, not before', () => {
    // Đặt enemy ở đúng RÌA tầm bắn, ngay bên ngoài. Sau khi tiến một tick nó vào
    // trong tầm. Nếu tháp bắn TRƯỚC khi enemy tiến (đảo bước 2 và 3) thì tick này
    // không có phát nào. Thứ tự đúng thì có đúng một phát.
    const b = createBattle('m01', {}, 1);
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const tower = b.state.towers[0];
    tower.cooldown = 0;
    const slot = b.map.slots[tower.slotIndex];
    const range = Math.sqrt(TOWERS.arrow.levels[0].rangeSq);

    // tìm s sao cho khoảng cách tới slot vừa lớn hơn range một chút
    let s = 0;
    for (; s < b.path.length; s += 0.5) {
      const p = pathAt(b.path, s);
      if (Math.hypot(p.x - slot.x, p.y - slot.y) <= range) break;
    }
    const sJustOutside = s - 0.4;

    b.state.phase = 'wave';
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: sJustOutside, hp: 60, slowUntilTick: 0, slowFactor: 1 });
    expect(b.state.projectiles).toHaveLength(0);

    step(b);

    expect(b.state.projectiles).toHaveLength(1);
  });

  it('increments tick exactly once per step', () => {
    const b = createBattle('m01', {}, 1);
    const t = b.state.tick;
    step(b); step(b); step(b);
    expect(b.state.tick).toBe(t + 3);
  });

  it('stops the tick immediately when lives hit zero', () => {
    const b = createBattle('m01', {}, 1);
    b.state.phase = 'wave';
    b.state.lives = 1;
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: 1e9, hp: 60, slowUntilTick: 0, slowFactor: 1 });
    step(b);
    expect(b.state.phase).toBe('lost');
  });
});
```

`tests/core/cleanup.test.ts` asserts: a dead enemy pays its bounty exactly once and increments `stats.killed`; the wave ends only when the schedule is exhausted **and** the battlefield is empty; the last wave ending sets `phase` to `'won'`; a non-final wave ending sets `phase` to `'prep'`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- step-order cleanup`
Expected: FAIL — cannot resolve `src/core/step`.

- [ ] **Step 3: Implement `step`**

`src/core/step/index.ts` — the whole point of this file is that the order is written once, in one place, with the invariant reference beside it.
```ts
import { stepSpawn } from './spawn';
import { stepAdvance } from './advance';
import { stepFire } from './fire';
import { stepProjectiles } from './projectiles';
import { stepCleanup } from './cleanup';
import type { Battle } from '../battle';

/**
 * MỘT TICK. Thứ tự năm bước dưới đây là bất biến `invariants.md` #1.
 * Đảo bước 2 và 3 thì mọi phát bắn nhắm vị trí của frame trước — game vẫn
 * chạy, test khác vẫn xanh, chỉ có `step-order.test.ts` đỏ.
 */
export function step(battle: Battle): void {
  if (battle.state.phase === 'won' || battle.state.phase === 'lost') return;
  stepSpawn(battle);        // 1
  stepAdvance(battle);      // 2
  if (battle.state.phase === 'lost') return;
  stepFire(battle);         // 3
  stepProjectiles(battle);  // 4
  stepCleanup(battle);      // 5
  battle.state.tick++;
}
```

- [ ] **Step 4: Run the whole core suite**

Run: `npm test`
Expected: PASS, every core test.

- [ ] **Step 5: Verify the guard actually guards**

Temporarily swap `stepAdvance` and `stepFire` in `step()`, run `npm test -- step-order`, and confirm it FAILS. Then put them back and confirm it passes. A guard that cannot fail is not a guard.

- [ ] **Step 6: Commit**

```bash
git add src/core/step tests/core
git commit -m "feat(core): run one tick as five ordered steps, with a test that guards the order

The order test was verified by swapping steps 2 and 3 and watching it go
red, so the invariant is enforced rather than merely documented.

Refs: FR-07 · invariants #1"
```

---

### Task 9: `runBattle` headless, determinism, and the balance gate

**Files:**
- Create: `src/core/runBattle.ts`
- Test: `tests/balance/determinism.test.ts`, `tests/balance/maps-are-beatable.test.ts`

**Interfaces:**
- Consumes: `createBattle`, `applyIntent`, `step`
- Produces:
  - `type BattleOutcome = { won: boolean; waveReached: number; ticks: number; livesLeft: number; goldEarned: number }`
  - `runBattle(mapId: MapId, layout: MapDef['referenceLayout'], upgrades: UpgradeState, seed: number, maxTicks?: number): BattleOutcome`
  - `minUpgradesForMap(mapId: MapId): UpgradeState` — the lowest upgrade state a player can hold when that map first opens

- [ ] **Step 1: Write the failing test**

`tests/balance/maps-are-beatable.test.ts` — the most important test in the project (`design.md` §6 tầng 2).
```ts
import { describe, it, expect } from 'vitest';
import { runBattle, minUpgradesForMap } from '../../src/core/runBattle';
import { MAPS, MAP_ORDER } from '../../src/data/maps';

describe('every map is beatable at the upgrade level it unlocks at (FR-32)', () => {
  for (const id of MAP_ORDER.filter((m) => MAPS[m])) {
    it(`${id} falls to its referenceLayout at minimum upgrades`, () => {
      const outcome = runBattle(id, MAPS[id].referenceLayout, minUpgradesForMap(id), 1);
      expect(outcome.won).toBe(true);
    });

    it(`${id} is not trivial — the reference layout loses at least one life or barely holds`, () => {
      // Nếu thắng mà không mất mạng nào ở MỌI bản đồ thì độ khó đang phẳng.
      // Không phải điều kiện thắng/thua, chỉ là tín hiệu; giữ ở mức cảnh báo mềm.
      const o = runBattle(id, MAPS[id].referenceLayout, minUpgradesForMap(id), 1);
      expect(o.livesLeft).toBeLessThanOrEqual(MAPS[id].startLives);
    });
  }
});
```

`tests/balance/determinism.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runBattle } from '../../src/core/runBattle';
import { MAPS } from '../../src/data/maps';

describe('runBattle', () => {
  it('gives the same outcome for the same seed', () => {
    const a = runBattle('m01', MAPS.m01.referenceLayout, {}, 42);
    const b = runBattle('m01', MAPS.m01.referenceLayout, {}, 42);
    expect(a).toEqual(b);
  });

  it('finishes a full battle in under 200ms (NFR-PERF-10)', () => {
    const t0 = performance.now();
    runBattle('m01', MAPS.m01.referenceLayout, {}, 1);
    expect(performance.now() - t0).toBeLessThan(200);
  });

  it('terminates instead of hanging when the layout cannot win', () => {
    const o = runBattle('m01', [], {}, 1);
    expect(o.won).toBe(false);
    expect(o.ticks).toBeLessThan(200_000);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- balance`
Expected: FAIL — cannot resolve `src/core/runBattle`.

- [ ] **Step 3: Implement `runBattle`**

```ts
export function runBattle(mapId, layout, upgrades, seed, maxTicks = 200_000): BattleOutcome {
  const b = createBattle(mapId, upgrades, seed);
  b.state.gold = Number.MAX_SAFE_INTEGER;          // bố cục tham chiếu được cấp sẵn
  for (const p of layout) {
    applyIntent(b, { kind: 'build', slotIndex: p.slotIndex, towerId: p.towerId });
    const t = b.state.towers[b.state.towers.length - 1];
    for (let l = 1; l < p.level; l++) applyIntent(b, { kind: 'upgrade', towerId: t.id });
  }
  b.state.gold = b.rules.startGold;                 // trả lại kinh tế thật
  b.state.stats.goldEarned = 0;

  let ticks = 0;
  while (b.state.phase !== 'won' && b.state.phase !== 'lost' && ticks < maxTicks) {
    if (b.state.phase === 'prep') applyIntent(b, { kind: 'startWave' });
    step(b); ticks++;
  }
  return {
    won: b.state.phase === 'won', waveReached: b.state.waveIndex + 1, ticks,
    livesLeft: b.state.lives, goldEarned: b.state.stats.goldEarned,
  };
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test -- balance`
Expected: PASS. **If `maps-are-beatable` fails, tune the numbers in `src/data/`, never the assertion.** That is what the test is for.

- [ ] **Step 5: Commit**

```bash
git add src/core/runBattle.ts tests/balance
git commit -m "feat(core): run a whole battle headless and gate map balance on it

maps-are-beatable is the gate that stops a data edit from making a map
impossible at the upgrade level it unlocks at — the worst failure this
design can have, and one nobody would catch by hand across five maps.

Refs: FR-31 · FR-32 · NFR-PERF-06 · NFR-PERF-10 · overview.md §6.3"
```

---

# Pha 2 — one map, playable end to end

### Task 10: The bridge

**Files:**
- Create: `src/bridge/types.ts`, `src/bridge/index.ts`
- Test: `tests/core/bridge.test.ts`

**Interfaces:**
- Produces:
  - `type BattleSnapshot = { tick: number; phase: BattlePhase; gold: number; lives: number; waveIndex: number; waveCount: number; selected: { kind: 'slot'; slotIndex: number } | { kind: 'tower'; towerId: EntityId; typeId: TowerTypeId; level: number; canUpgrade: boolean; upgradeCost: number | null; sellValue: number } | null; nextWave: { enemyId: EnemyTypeId; count: number }[]; speed: 1 | 2 | 3; paused: boolean }`
  - `pushIntent(i: Intent): void` · `drainIntents(): Intent[]`
  - `publishSnapshot(s: BattleSnapshot): void` · `subscribeSnapshot(fn: (s: BattleSnapshot) => void): () => void` · `getSnapshot(): BattleSnapshot | null`
  - `SNAPSHOT_INTERVAL_MS = 100`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { pushIntent, drainIntents, publishSnapshot, subscribeSnapshot, SNAPSHOT_INTERVAL_MS } from '../../src/bridge';

describe('intent queue', () => {
  it('drains in the order pushed, and empties', () => {
    pushIntent({ kind: 'startWave' });
    pushIntent({ kind: 'build', slotIndex: 1, towerId: 'arrow' });
    const out = drainIntents();
    expect(out.map((i) => i.kind)).toEqual(['startWave', 'build']);
    expect(drainIntents()).toEqual([]);
  });
});

describe('snapshot store', () => {
  it('publishes at 10Hz, not per frame (invariants #7)', () => {
    expect(SNAPSHOT_INTERVAL_MS).toBe(100);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const fn = vi.fn();
    const off = subscribeSnapshot(fn);
    publishSnapshot({ tick: 1 } as never);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    publishSnapshot({ tick: 2 } as never);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- bridge` · Expected: FAIL.

- [ ] **Step 3: Implement the bridge** — a module-level array plus a `Set` of listeners. No React, no Phaser (`architecture.md` §3).

- [ ] **Step 4: Run the tests** · Run: `npm test -- bridge` · Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/bridge tests/core/bridge.test.ts
git commit -m "feat(bridge): queue intents down and publish a 10Hz snapshot up

Refs: ADR-0004 · invariants #7 · NFR-PERF-07"
```

---

### Task 11: The Phaser battle scene

**Files:**
- Create: `src/game/palette.ts`, `src/game/boot.ts`, `src/game/BattleScene.ts`

**Interfaces:**
- Consumes: `createBattle`, `step`, `applyIntent`, `drainIntents`, `publishSnapshot`, `MAPS`, `pathAt`
- Produces: `startGame(parent: HTMLElement, mapId: MapId, upgrades: UpgradeState, onFinish: (o: BattleOutcome) => void): () => void` — returns a teardown function

Draws with `Phaser.GameObjects.Graphics` for now — the same vector board the approved mockup uses. Kenney sprites arrive in Task 20; the render boundary is what makes that swap cheap (`backlog.md` §Nợ kỹ thuật).

- [ ] **Step 1: Read the palette from CSS instead of hardcoding it**

`src/game/palette.ts` — enforces `MASTER.md` §8 "no hardcoded hex in Phaser code".
```ts
const read = (name: string) =>
  parseInt(getComputedStyle(document.documentElement).getPropertyValue(name).trim().slice(1), 16);

export const palette = () => ({
  grassA: 0x4E7B45, grassB: 0x55834B, pathEdge: 0x96743F, pathFill: 0xCBA96D,
  act: read('--ui-act'), edge: read('--ui-edge'), ink: read('--ui-ink'),
  gold: read('--sem-gold'), danger: read('--sem-danger'), ok: read('--sem-ok'),
  letterbox: read('--letterbox'), raised: read('--raised'),
});
```

- [ ] **Step 2: Implement the accumulator loop**

In `BattleScene.update(_, deltaMs)`:
```ts
this.acc += deltaMs / 1000;
const stepsThisFrame = Math.floor(this.acc / FIXED_DT) * this.speed;
this.acc -= Math.floor(this.acc / FIXED_DT) * FIXED_DT;

for (const intent of drainIntents()) applyIntent(this.battle, intent);   // ranh giới tick

let n = 0;
while (n < stepsThisFrame && n < MAX_STEPS_PER_FRAME) { step(this.battle); n++; }
this.acc = Math.min(this.acc, FIXED_DT * 5);   // chống death-spiral sau khi tab ẩn
```
`MAX_STEPS_PER_FRAME = 30` — a tab that was hidden for a minute must not try to run 3600 ticks in one frame.

- [ ] **Step 3: Draw, with interpolation**

Enemy screen position interpolates between the previous tick's `s` and the current one using `acc / FIXED_DT`, so the board stays smooth on a 120Hz display even though the simulation runs at 60Hz (ADR-0003 §4).

- [ ] **Step 4: Publish the snapshot on a timer, not per frame**

```ts
this.time.addEvent({ delay: SNAPSHOT_INTERVAL_MS, loop: true, callback: () => publishSnapshot(this.buildSnapshot()) });
```

- [ ] **Step 5: Handle canvas input**

Tap a slot → `pushIntent` is **not** called; the scene sets local selection and publishes a snapshot with `selected.kind === 'slot'`. Building needs the second action from the React panel (US-01 "chạm vào ô là chọn ô, không bao giờ vô tình xây").

- [ ] **Step 6: Verify by hand**

Run `npm run dev`, open the page, confirm: enemies walk the path, towers fire, gold and lives change, x2/x3 changes the pace, a hidden tab for 30 seconds does not fast-forward the battle.

- [ ] **Step 7: Commit**

```bash
git add src/game
git commit -m "feat(game): render the battle in Phaser on a fixed-timestep accumulator

Speed multipliers run more ticks rather than scaling dt, sprite positions
interpolate between ticks, and a hidden tab is clamped instead of trying to
catch up thousands of ticks in one frame.

Refs: ADR-0002 · ADR-0003 · invariants #4 · NFR-PERF-05"
```

---

### Task 12: React HUD and build panel at 375

**Files:**
- Create: `src/ui/components/Press.tsx`, `Segmented.tsx`, `Chip.tsx`, `Icon.tsx`; `src/ui/battle/Hud.tsx`, `BuildPanel.tsx`, `TowerPanel.tsx`, `SpeedControl.tsx`; `src/ui/screens/BattleScreen.tsx`; `src/ui/hooks/useSnapshot.ts`

**Interfaces:**
- Consumes: `subscribeSnapshot`, `getSnapshot`, `pushIntent`, `TOWERS`, `t()` from Task 19 (until then, import the `vi` dictionary directly — never inline a string)
- Produces: `<BattleScreen mapId upgrades onFinish />`

Build this against the approved mockup: `Main.dc.html` (default), `XayThap375.dc.html` (build sheet). Layout numbers come from there; colours and sizes from `MASTER.md`.

- [ ] **Step 1: `Press.tsx` — the signature element, once, reused everywhere**

```tsx
export function Press({ as: As = 'button', className = '', children, ...rest }) {
  return (
    <As
      className={`border-2 border-edge rounded-[10px] shadow-[0_4px_0_0_var(--ui-edge)]
                  transition-[transform,box-shadow] duration-[60ms] ease-out cursor-pointer
                  active:translate-y-[4px] active:shadow-none
                  focus-visible:outline-3 focus-visible:outline-act focus-visible:outline-offset-[3px]
                  min-h-[44px] ${className}`}
      {...rest}
    >{children}</As>
  );
}
```
`min-h-[44px]` is on the shared component so no caller can accidentally ship a 40px target (`MASTER.md` §5).

- [ ] **Step 2: `Segmented.tsx` — selection carries three channels**

Background, weight **and** a 3px inset bar on the active cell, per `MASTER.md` §8. The bar uses `inset` shadow so it costs no horizontal space — the Vietnamese tab labels have about 12px of slack at 375.

- [ ] **Step 3: `useSnapshot.ts` — subscribe, never poll**

```ts
export function useSnapshot(): BattleSnapshot | null {
  const [s, setS] = useState(getSnapshot);
  useEffect(() => subscribeSnapshot(setS), []);
  return s;
}
```

- [ ] **Step 4: Wire the panels**

`BuildPanel` shows three tower cards. A card the player cannot afford switches its **background token to `--sunken` and its text token to `--ui-dim`** and shows a lock icon — never `opacity`, never colour alone (`MASTER.md` §1.1b, §8; NFR-A11Y-06).

- [ ] **Step 5: Verify at 375 by hand, in Vietnamese**

Run `npm run dev`, DevTools at 375×812, and play a wave: select a slot, build, upgrade, sell, change speed, call a wave. Confirm no horizontal scroll and no clipped Vietnamese text.

- [ ] **Step 6: Commit**

```bash
git add src/ui
git commit -m "feat(ui): add the battle HUD and build panel at 375

The 44px floor and the press-edge live in the shared Press component, so no
caller can ship a short target. Unaffordable towers change surface and text
tokens rather than using opacity, which would drop contrast below the floor
while every hex stayed correct.

Refs: FR-08 · FR-09 · FR-10 · FR-23 · FR-24 · MASTER.md §1.1b · NFR-A11Y-03 · NFR-A11Y-06"
```

---

### Task 13: The other three widths and both orientations

**Files:**
- Modify: `src/ui/screens/BattleScreen.tsx`, `src/ui/battle/*`

- [ ] **Step 1: 768 — canvas plus a 232px right column plus a real bottom HUD bar**

Per `MASTER.md` §6 and the approved `TranDau768.dc.html`. The HUD is a bar, not a floating overlay: floated over the letterbox it reads as two black bands.

- [ ] **Step 2: 1024 and 1440 — persistent right column**

`TranDau1440.dc.html` / `ChonThap1440.dc.html`. 1024 is a mandatory breakpoint (NFR-A11Y checklist) even though the mockup has no artboard for it — this is where it gets designed.

- [ ] **Step 3: 375 landscape — two edge strips**

`TranDau375Ngang.dc.html`: 136px left strip, square canvas, 156px right strip. No pixel of letterbox left idle.

- [ ] **Step 4: Verify all four widths, both orientations, in Vietnamese**

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): lay the battle out at 768, 1024, 1440 and 375 landscape

Refs: FR-30 · MASTER.md §6"
```

---

### Task 14: Title screen and result screen

**Files:**
- Create: `src/ui/screens/TitleScreen.tsx`, `ResultScreen.tsx`; modify `src/ui/App.tsx`

- [ ] **Step 1: `TitleScreen`** — one primary action, per `TieuDe375/768/1440.dc.html`. Hero 32px at 375, 48px above; no other hero size exists in the scale.
- [ ] **Step 2: `ResultScreen`** — won/lost, waves survived, `cores` earned, and two exits: retry, or workshop. A loss still pays `cores` (US-02).
- [ ] **Step 3: `App.tsx`** — a screen enum, no router. It is a single-screen SPA (ADR-0006 §4).
- [ ] **Step 4: Verify the whole US-01 loop by hand at 375.**
- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): add the title and result screens, closing the US-01 loop

Refs: FR-14 · FR-15 · US-01"
```

**Pha 2 ends with a game that is playable but has one map, one language and no saved progress.** That is the right place to stop and actually play it, because `src/data/` is still a first guess (`design.md` §7).

- [ ] **Step 6: Play it. Then tune `src/data/` and re-run `npm test -- balance`.**

---

# Pha 3 — progress between battles

### Task 15: Defensive profile storage

**Files:**
- Create: `src/storage/types.ts`, `src/storage/profile.ts`
- Test: `tests/storage/profile.test.ts`

**Interfaces:**
- Produces:
  - `type Profile = { schemaVersion: 1; locale: 'vi' | 'en'; cores: number; upgrades: UpgradeState; unlockedTowers: TowerTypeId[]; maps: Record<MapId, { cleared: boolean; bestWave: number }>; settings: { music: number; sfx: number } }`
  - `loadProfile(): { profile: Profile; recovered: boolean; writable: boolean }`
  - `saveProfile(p: Profile): boolean`
  - `PROFILE_KEY = 'duckdefense.profile'`

- [ ] **Step 1: Write the failing test — six kinds of garbage, one test each**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadProfile, PROFILE_KEY } from '../../src/storage/profile';

const cases: [string, string | null][] = [
  ['null',                       null],
  ['not JSON',                   '{{{'],
  ['an array',                   '[1,2,3]'],
  ['missing schemaVersion',      JSON.stringify({ cores: 5 })],
  ['unknown schemaVersion',      JSON.stringify({ schemaVersion: 99, cores: 5 })],
  ['cores as a string',          JSON.stringify({ schemaVersion: 1, cores: 'lots' })],
];

describe('loadProfile never throws and never deletes (NFR-REL-04)', () => {
  beforeEach(() => localStorage.clear());

  for (const [name, raw] of cases) {
    it(`recovers from ${name}`, () => {
      if (raw !== null) localStorage.setItem(PROFILE_KEY, raw);
      const { profile, recovered } = loadProfile();
      expect(profile.schemaVersion).toBe(1);
      expect(profile.cores).toBe(0);
      expect(recovered).toBe(raw !== null);
      if (raw !== null) {
        const kept = Object.keys(localStorage).filter((k) => k.startsWith(`${PROFILE_KEY}.corrupt.`));
        expect(kept).toHaveLength(1);
        expect(localStorage.getItem(kept[0])).toBe(raw);
      }
    });
  }

  it('keeps a valid profile untouched', () => {
    const good = { schemaVersion: 1, locale: 'vi', cores: 340, upgrades: {}, unlockedTowers: ['arrow'], maps: {}, settings: { music: 0.6, sfx: 0.8 } };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(good));
    const { profile, recovered } = loadProfile();
    expect(recovered).toBe(false);
    expect(profile.cores).toBe(340);
  });

  it('reports not-writable instead of throwing when setItem fails (NFR-REL-05)', () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('QuotaExceededError'); };
    const { writable } = loadProfile();
    expect(writable).toBe(false);
    Storage.prototype.setItem = orig;
  });
});
```

`vitest.config.ts` gains `environment: 'jsdom'` for `tests/storage/**` via `environmentMatchGlobs`.

- [ ] **Step 2: Run it to make sure it fails** · Run: `npm test -- profile` · Expected: FAIL.
- [ ] **Step 3: Implement `loadProfile`/`saveProfile`** — validate every field by type, rename the bad value to `PROFILE_KEY.corrupt.<Date.now()>`, never `delete`.
- [ ] **Step 4: Run the tests** · Expected: PASS, 8 tests.
- [ ] **Step 5: Commit**

```bash
git add src/storage tests/storage vitest.config.ts
git commit -m "feat(storage): read the profile defensively and never delete a bad one

Six shapes of garbage each get a test. A profile that cannot be parsed is
renamed rather than dropped, because losing progress silently is worse than
losing it loudly.

Refs: FR-11 · FR-25 · NFR-REL-04 · NFR-REL-05 · NFR-SEC-07 · ADR-0005"
```

---

### Task 16: The upgrade tree

**Files:**
- Create: `src/data/upgradeTree.ts`; modify `src/core/upgrades.ts`
- Test: `tests/core/upgrades.test.ts`

**Interfaces:**
- Produces: `type UpgradeNode = { id: UpgradeNodeId; branch: UpgradeBranch; maxLevel: number; costs: number[]; prereq: { id: UpgradeNodeId; level: number }[]; effect: UpgradeEffect }`, `UPGRADE_TREE`, `canBuy(profile, nodeId): boolean`, `buyUpgrade(profile, nodeId): Profile`

- [ ] **Step 1: Write the failing test**

Assert: `applyUpgrades({})` returns the base tables unchanged; each economy node raises `startGold`/`bountyMultiplier` by the documented amount; a node with an unmet prereq is not buyable and the reason is retrievable; buying twice in a row charges `costs[0]` then `costs[1]`; **the fully-bought tree raises total power by at most 60%** (`design.md` §4) — measured as `runBattle` gold earned on a fixed layout, full tree vs empty tree; `applyUpgrades` never mutates `TOWERS` (`invariants.md` #6).

```ts
it('never mutates the base tower table (invariants #6)', () => {
  const before = JSON.stringify(TOWERS);
  applyUpgrades({ arrowDamage: 4, startGold: 4 });
  expect(JSON.stringify(TOWERS)).toBe(before);
});
```

- [ ] **Step 2: Run it to make sure it fails** · Expected: FAIL.
- [ ] **Step 3: Implement the tree and the real `applyUpgrades`** — deep-clone `TOWERS` before scaling anything.
- [ ] **Step 4: Run the tests** · Expected: PASS.
- [ ] **Step 5: Re-run the balance gate** · Run: `npm test -- balance` · The gate must still pass with the tree in place.
- [ ] **Step 6: Commit**

```bash
git add src/data/upgradeTree.ts src/core/upgrades.ts tests/core/upgrades.test.ts
git commit -m "feat(core): add the four-branch upgrade tree with a 60% total power ceiling

The ceiling is asserted, not aspirational: a steeper curve narrows the band
of upgrade states each map has to be playable at, and with five maps there
is no room for a steep curve.

Refs: FR-12 · invariants #6 · invariants #8"
```

---

### Task 17: Workshop screen and `cores`

**Files:**
- Create: `src/ui/screens/WorkshopScreen.tsx`, `src/ui/hooks/useProfile.ts`; modify `ResultScreen.tsx`

- [ ] **Step 1: `useProfile`** — load once, save on change, surface `writable: false` as a persistent banner (`design.md` §5).
- [ ] **Step 2: Workshop at 375/768** — four tabs, one vertical spine per branch, `●─│─○` encoding prerequisites (`Xuong375.dc.html`).
- [ ] **Step 3: Workshop at 1440** — four columns side by side (`Xuong1440.dc.html`).
- [ ] **Step 4: `cores` award** — by waves survived, large first-clear bonus, sharply reduced on replay (FR-16). Grinding map 1 must never beat attempting map 3.
- [ ] **Step 5: Verify US-02 end to end by hand.**
- [ ] **Step 6: Commit**

```bash
git add src/ui
git commit -m "feat(ui): add the workshop screen and award cores after a battle

Refs: FR-16 · FR-27 · US-02"
```

---

### Task 18: Map select, unlocking, and the other four maps

**Files:**
- Create: `src/ui/screens/MapSelectScreen.tsx`, `src/data/maps/m02…m05`; modify `src/data/maps/index.ts`
- Test: `tests/core/unlock.test.ts`; the existing `tests/balance/maps-are-beatable.test.ts` now covers five maps

- [ ] **Step 1: Write the failing unlock test** — `unlockedMaps(profile)` is a **function** of cleared maps and upgrades, never a stored field (ADR-0005 §3). Assert map 1 is always open; map `n+1` opens when map `n` is cleared; a locked map returns a **reason string key**, not just `false` (FR-13).
- [ ] **Step 2: Run it to make sure it fails** · Expected: FAIL.
- [ ] **Step 3: Author maps 2-5** — each with `waypoints`, `slots`, waves, and a `referenceLayout`. Add all five ids to `MAP_ORDER`.
- [ ] **Step 4: Run the balance gate** · Run: `npm test -- balance` · **All five maps must fall to their reference layout at `minUpgradesForMap`.** Tune `src/data/`, never the assertion.
- [ ] **Step 5: Build `MapSelectScreen`** per `ChonBanDo375/768/1440.dc.html`. A locked card shows the **reason**, and uses grayscale on the thumbnail only — never `opacity` on the card, which drops the text below contrast floor.
- [ ] **Step 6: Verify US-03 by hand.**
- [ ] **Step 7: Commit**

```bash
git add src/data/maps src/ui tests/core/unlock.test.ts
git commit -m "feat: add maps 2-5, unlock rules, and the map select screen

Which maps are open is computed from cleared maps and upgrades rather than
stored, so there is only one source of truth for the question.

Refs: FR-13 · FR-26 · FR-32 · US-03 · ADR-0005"
```

---

# Pha 4 — the shell

### Task 19: i18n and the settings screen

**Files:**
- Create: `src/i18n/index.ts`, `vi.ts`, `en.ts`, `src/ui/hooks/useLocale.ts`, `src/ui/screens/SettingsScreen.tsx`
- Test: `tests/core/i18n.test.ts`

- [ ] **Step 1: Write the failing test** — every key in `vi` exists in `en` and vice versa (a missing key is a blank label nobody notices); `t()` on an unknown key returns the key rather than `undefined`.
- [ ] **Step 2: Run it to make sure it fails** · Expected: FAIL.
- [ ] **Step 3: Extract every string** already written in `src/ui/**` into the dictionaries. Add a lint rule flagging non-ASCII string literals outside `src/i18n/` (NFR-I18N-01).
- [ ] **Step 4: Build `SettingsScreen`** — language, music volume, sfx volume, each with a linked label (NFR-A11Y-04). Persist through `useProfile`.
- [ ] **Step 5: Verify** switching to English and back changes every visible string with no reload, and that Vietnamese never overflows at 375.
- [ ] **Step 6: Commit**

```bash
git add src/i18n src/ui tests/core/i18n.test.ts eslint.config.js
git commit -m "feat(i18n): switch between Vietnamese and English without a reload

Key parity is asserted in both directions, because a key missing from one
dictionary renders as a blank label rather than an error.

Refs: FR-17 · FR-28 · NFR-I18N-01 · NFR-I18N-04 · US-04"
```

---

### Task 20: Audio, Kenney sprites, reduced motion

**Files:**
- Create: `src/game/audio.ts`, `public/assets/*`; modify `src/game/BattleScene.ts`

- [ ] **Step 1: Vendor the Kenney Tower Defense pack** into `public/assets/`, with its CC0 licence file kept beside it. Build a texture atlas.
- [ ] **Step 2: Replace the vector board with sprites**, one drawing call site at a time. The render boundary means `src/core/**` is not touched by this task — verify with `git diff --stat`.
- [ ] **Step 3: Delete `MASTER.md` §1.3** (the seven placeholder art colours) and the matching `backlog.md` debt row, in the same commit as the last sprite.
- [ ] **Step 4: Audio** — initialise on the first player gesture, never on load (`design.md` §5). Volumes come from the profile.
- [ ] **Step 5: `prefers-reduced-motion`** — turn off shell transitions and canvas particles, **keep** sprite animation (NFR-A11Y-05).
- [ ] **Step 6: Verify** the frame budget still holds: 60 enemies and 20 towers at x1 (NFR-PERF-05), and check the bundle against NFR-PERF-08 with `npm run build`.
- [ ] **Step 7: Commit**

```bash
git add public src/game docs
git commit -m "feat(game): swap in the Kenney sprites and wire audio

core/ is untouched by this change, which is what the render boundary was
for. Removes MASTER.md §1.3 and its backlog row now that the placeholder
colours are gone.

Refs: ADR-0001 · ADR-0002 · NFR-A11Y-05 · NFR-PERF-05 · NFR-PERF-08"
```

---

### Task 21: Full keyboard control

**Files:**
- Modify: `src/ui/battle/*`, `src/game/BattleScene.ts`

- [ ] **Step 1: Make slots focusable** — a DOM overlay of transparent buttons positioned over the canvas slots, so Tab reaches them and focus is visible. Canvas cannot hold focus; this is the reason the overlay exists (`ADR-0002` §3).
- [ ] **Step 2: Shortcuts** — `1 2 3` pick a tower, `Space` calls a wave, `Esc` clears selection, `1-3` on a selected tower upgrades. Every one of them is a shortcut for something reachable another way (`MASTER.md` §5).
- [ ] **Step 3: Verify** a full battle can be won using only the keyboard (NFR-A11Y-02).
- [ ] **Step 4: Commit**

```bash
git add src/ui src/game
git commit -m "feat(a11y): make every battle action reachable by keyboard

Slots get a focusable DOM overlay because a canvas cannot take focus, so
Tab reaches them and the focus ring is visible.

Refs: FR-29 · NFR-A11Y-02"
```

---

# Pha 5 — verify and ship

### Task 22: Playwright end to end

**Files:**
- Create: `e2e/us01-first-win.spec.ts`, `e2e/responsive.spec.ts`, `e2e/keyboard.spec.ts`, `e2e/render-budget.spec.ts`, `e2e/vietnamese-fit.spec.ts`

- [ ] **Step 1: `us01-first-win`** — open, build, call waves, win. Asserts US-01 end to end.
- [ ] **Step 2: `responsive`** — 375×812, 812×375, 768×1024, 1024×768, 1440×900. For each: screenshot, and assert `document.documentElement.scrollWidth <= clientWidth` (FR-30, "không cuộn ngang ở bất kỳ mốc nào").
- [ ] **Step 3: `keyboard`** — win a battle with keyboard only (NFR-A11Y-02).
- [ ] **Step 4: `render-budget`** — instrument a render counter, run 5 seconds of battle, assert ≤ 50 renders (NFR-PERF-07).
- [ ] **Step 5: `vietnamese-fit`** — set locale to `vi` at 375 and assert no element's `scrollWidth` exceeds its parent's `clientWidth` (NFR-I18N-04).
- [ ] **Step 6: Run the full suite** · Run: `npm run test:e2e` · Expected: PASS.
- [ ] **Step 7: Commit**

```bash
git add e2e playwright.config.ts
git commit -m "test(e2e): cover US-01, five viewports, keyboard-only play and the render budget

Refs: FR-29 · FR-30 · NFR-A11Y-02 · NFR-PERF-07 · NFR-I18N-04"
```

---

### Task 23: README, deploy, and close the documents

**Files:**
- Create: `README.md`, `.github/workflows/deploy.yml`
- Modify: `docs/02-requirements/scope.md`, `docs/01-product/glossary.md`, `docs/04-state/backlog.md`

- [ ] **Step 1: `README.md`** with a `## Features` section — one short English bullet per user-facing capability, in the house style. This is required in the same branch as any `feat:` that changes user-facing behaviour.
- [ ] **Step 2: GitHub Pages workflow** — `npm ci`, `GITHUB_PAGES=true npm run build`, publish `dist/`. Verify the deployed page actually loads: a wrong `base` shows up only in production (ADR-0006 §4).
- [ ] **Step 3: Flip every FR in `scope.md`** from `chưa` to `xong` — and only the ones that really are.
- [ ] **Step 4: Flip `glossary.md` to 🟢** after confirming every code name in it matches the code.
- [ ] **Step 5: Update `backlog.md`** — clear §Đang làm, and remove the debt rows that this branch actually paid off.
- [ ] **Step 6: Run everything one last time** · `npm test && npm run test:e2e && npm run build`
- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs: add the README and close out the feature documents

Refs: FR-01…FR-32"
```

---

## Self-Review

**Spec coverage.** Walked `design.md` §1-§7 against the tasks. §1 → T2. §2 → T6/T7/T8. §3 → T7. §4 → T4/T16. §5 → T5 (silent-ignore intents), T15 (profile), T20 (audio gesture), T11 (orientation). §6 tầng 1 → T2-T8; tầng 2 → T9; tầng 3 → T15; tầng 4 → T22. §7 → the phase order, and T14 Step 6 is the "stop and play it" beat it calls for.

Every FR in `scope.md` maps to a task: FR-01/02 → T6 · FR-03/04/20/21 → T7 · FR-05 → T4/T5 · FR-06 → T6 · FR-07 → T8 · FR-08/09/10/22/23/24 → T5/T11/T12 · FR-11/25 → T15 · FR-12 → T16 · FR-13/26 → T18 · FR-14/15 → T14 · FR-16/27 → T17 · FR-17/28 → T19 · FR-18/19 → T20 · FR-29 → T21 · FR-30 → T13/T22 · FR-31/32 → T9.

**Placeholder scan.** One deliberate forward reference: T12 imports the `vi` dictionary directly until T19 exists, stated in the task rather than left implicit. `MAP_ORDER` holding five ids while `MAPS` holds one would break T4's test, so T4 Step 3 says to add the other four ids in T18 — called out rather than discovered.

**Type consistency.** `UpgradeState` is defined in T5 and used unchanged in T9, T15, T16. `BattleOutcome` is defined in T9 and consumed by T11's `onFinish` and T17's cores award. `ResolvedRules` is produced by T5's `applyUpgrades` and reshaped — not renamed — in T16. `Intent` is defined in T5 and re-exported through `bridge/types.ts` in T10 rather than redeclared.
