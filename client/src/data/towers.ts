/**
 * Số liệu tháp. SỐ, không logic — `architecture.md` §3.
 *
 * `arrow`, `cannon`, `frost` mở từ đầu. `bolt` và `venom` mở qua nhánh "Mở khoá"
 * của cây nâng cấp (FR-12).
 *
 * Cân bằng ở đây là phỏng đoán đầu tiên — `backlog.md` §Nợ kỹ thuật.
 */

export type TowerTypeId = 'arrow' | 'cannon' | 'frost' | 'bolt' | 'venom';

/** v1 chỉ dùng `first`. Ba mode kia là chỗ mở rộng đã tính trước — `design.md` §3. */
export type TargetingMode = 'first' | 'last' | 'strongest' | 'closest';

export type TowerLevel = {
  damage: number;
  /** Bình phương tầm bắn — so sánh khoảng cách bình phương, không gọi Math.sqrt. */
  rangeSq: number;
  cooldownTicks: number;
  /** 0 = đơn mục tiêu. */
  splashRadius: number;
  /** 1 = không làm chậm. */
  slowFactor: number;
  slowTicks: number;
  /** Giá lên bậc kế. `null` ở bậc cuối, và CHỈ ở bậc cuối. */
  upgradeCost: number | null;
};

export type TowerType = {
  id: TowerTypeId;
  cost: number;
  targeting: TargetingMode;
  pierceArmor: boolean;
  unlockedAtStart: boolean;
  levels: TowerLevel[];
};

const NO_SLOW = { slowFactor: 1, slowTicks: 0 } as const;

export const TOWERS: Record<TowerTypeId, TowerType> = {
  arrow: {
    id: 'arrow',
    cost: 60,
    targeting: 'first',
    pierceArmor: false,
    unlockedAtStart: true,
    levels: [
      { damage: 12, rangeSq: 78 * 78, cooldownTicks: 50, splashRadius: 0, ...NO_SLOW, upgradeCost: 60 },
      { damage: 18, rangeSq: 88 * 88, cooldownTicks: 44, splashRadius: 0, ...NO_SLOW, upgradeCost: 110 },
      { damage: 27, rangeSq: 98 * 98, cooldownTicks: 38, splashRadius: 0, ...NO_SLOW, upgradeCost: null },
    ],
  },
  cannon: {
    id: 'cannon',
    cost: 110,
    targeting: 'first',
    pierceArmor: false,
    unlockedAtStart: true,
    levels: [
      { damage: 28, rangeSq: 66 * 66, cooldownTicks: 110, splashRadius: 30, ...NO_SLOW, upgradeCost: 120 },
      { damage: 41, rangeSq: 72 * 72, cooldownTicks: 100, splashRadius: 34, ...NO_SLOW, upgradeCost: 200 },
      { damage: 60, rangeSq: 80 * 80, cooldownTicks: 92, splashRadius: 40, ...NO_SLOW, upgradeCost: null },
    ],
  },
  frost: {
    id: 'frost',
    cost: 90,
    targeting: 'first',
    pierceArmor: false,
    unlockedAtStart: true,
    levels: [
      { damage: 4, rangeSq: 70 * 70, cooldownTicks: 70, splashRadius: 26, slowFactor: 0.62, slowTicks: 90, upgradeCost: 95 },
      { damage: 6, rangeSq: 76 * 76, cooldownTicks: 64, splashRadius: 30, slowFactor: 0.52, slowTicks: 110, upgradeCost: 160 },
      { damage: 9, rangeSq: 84 * 84, cooldownTicks: 58, splashRadius: 34, slowFactor: 0.44, slowTicks: 130, upgradeCost: null },
    ],
  },
  bolt: {
    id: 'bolt',
    cost: 260,
    targeting: 'first',
    pierceArmor: false,
    unlockedAtStart: false,
    levels: [
      { damage: 22, rangeSq: 58 * 58, cooldownTicks: 60, splashRadius: 44, ...NO_SLOW, upgradeCost: 190 },
      { damage: 33, rangeSq: 62 * 62, cooldownTicks: 54, splashRadius: 50, ...NO_SLOW, upgradeCost: 300 },
      { damage: 48, rangeSq: 68 * 68, cooldownTicks: 48, splashRadius: 56, ...NO_SLOW, upgradeCost: null },
    ],
  },
  venom: {
    id: 'venom',
    cost: 300,
    targeting: 'strongest',
    pierceArmor: true,
    unlockedAtStart: false,
    levels: [
      { damage: 16, rangeSq: 74 * 74, cooldownTicks: 40, splashRadius: 0, ...NO_SLOW, upgradeCost: 230 },
      { damage: 24, rangeSq: 80 * 80, cooldownTicks: 36, splashRadius: 0, ...NO_SLOW, upgradeCost: 360 },
      { damage: 36, rangeSq: 88 * 88, cooldownTicks: 32, splashRadius: 0, ...NO_SLOW, upgradeCost: null },
    ],
  },
};

export const TOWER_IDS = Object.keys(TOWERS) as TowerTypeId[];

/** Ba tháp mở từ đầu, đúng thứ tự hiện trong panel xây. */
export const STARTER_TOWER_IDS: TowerTypeId[] = TOWER_IDS.filter((id) => TOWERS[id].unlockedAtStart);
