/**
 * Kiểu và hằng của lõi mô phỏng.
 *
 * File này — và mọi file khác trong `core/` — KHÔNG được import Phaser, React,
 * `window`, `document`, `localStorage`, và không được gọi `Math.random`.
 * Ràng buộc đó được `eslint.config.js` kiểm bằng máy.
 * Xem `docs/03-design/architecture.md` §3 và ADR-0003.
 */

import type { EnemyTypeId } from '../data/enemies';
import type { TowerTypeId } from '../data/towers';

/** Số tick mô phỏng mỗi giây. Không bao giờ đổi theo tốc độ vẽ. */
export const TICKS_PER_SECOND = 60;

/**
 * Bước thời gian cố định của một tick, tính bằng giây.
 * Mô phỏng KHÔNG BAO GIỜ nhận `delta` thật của frame — tốc độ x2/x3 là chạy
 * nhiều tick hơn mỗi frame, không phải nhân `dt`. Xem `invariants.md` #4.
 */
export const FIXED_DT = 1 / TICKS_PER_SECOND;

export type EntityId = number;

export type BattlePhase = 'prep' | 'wave' | 'won' | 'lost';

/** State của RNG. Nằm TRONG BattleState nên nó được copy và tái tạo cùng trận. */
export type RngState = { seed: number };

export type Enemy = {
  id: EntityId;
  typeId: EnemyTypeId;
  /**
   * Quãng đường đã đi trên polyline, đơn vị bản đồ.
   * KHÔNG lưu {x, y} — toạ độ luôn là `pathAt(path, s)`. Xem `invariants.md` #2.
   */
  s: number;
  hp: number;
  /** Tick mà hiệu ứng chậm hết hạn. 0 = không bị chậm. */
  slowUntilTick: number;
  /** Hệ số nhân tốc độ khi đang bị chậm. 1 = không ảnh hưởng. */
  slowFactor: number;
};

export type Tower = {
  id: EntityId;
  typeId: TowerTypeId;
  /** Trỏ vào `MapDef.slots`. */
  slotIndex: number;
  /** Bậc trong trận, 1-based. Không liên quan tới bậc nâng cấp toàn cục. */
  level: number;
  /** Tick còn lại tới phát bắn kế tiếp. */
  cooldown: number;
  targetId: EntityId | null;
};

export type Projectile = {
  id: EntityId;
  ownerTypeId: TowerTypeId;
  /** Đạn CÓ toạ độ thật — nó không đi trên đường. */
  x: number;
  y: number;
  targetId: EntityId;
  /** Vị trí biết được lần cuối của mục tiêu, để đạn nổ lan không mất trắng
   *  khi mục tiêu chết giữa đường bay. Xem `design.md` §2 bước 4. */
  lastKnownX: number;
  lastKnownY: number;
  speed: number;
  damage: number;
  /** 0 = đơn mục tiêu. */
  splashRadius: number;
  pierceArmor: boolean;
  slowFactor: number;
  slowTicks: number;
};

export type BattleState = {
  /** Đếm tick, không phải ms. */
  tick: number;
  phase: BattlePhase;
  gold: number;
  lives: number;
  /** 0-based trong code, hiện +1 trên UI. */
  waveIndex: number;
  /** Đã sinh tới phần tử thứ mấy của lịch đợt hiện tại. */
  spawnCursor: number;
  /** Đã sinh bao nhiêu con từ phần tử `spawnCursor`. */
  spawnedFromCursor: number;
  /** Tick còn lại tới lần sinh kế tiếp. */
  spawnTimer: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  rng: RngState;
  nextId: EntityId;
  stats: { killed: number; leaked: number; goldEarned: number };
};
