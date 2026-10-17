/**
 * Cây nâng cấp toàn cục. SỐ, không logic — `architecture.md` §3.
 *
 * TRẦN SỨC MẠNH: cả cây mua hết ≈ +60% tổng lực, không phải +400%.
 * Cây càng dốc thì khoảng "bản đồ chơi được" càng hẹp, và với 5 bản đồ thì
 * không có chỗ cho một đường cong dốc (`design.md` §4). Trần này được
 * `tests/core/upgrades.test.ts` khẳng định, không phải chỉ mong ước.
 *
 * Hệ quả của cái trần đó, và nó định hình cả cây: các node CỘNG PHẦN TRĂM phải
 * ở mức nhỏ (4-5% mỗi bậc), vì chúng nhân nhau. Cảm giác tiến bộ mà người chơi
 * thật sự nhận ra không đến từ chúng, mà đến từ ba thứ là BƯỚC NHẢY, không phải
 * phần trăm: +200 vàng khởi đầu (gần gấp đôi kinh tế mở màn của bản đồ 1),
 * +6 mạng trên nền 14-20, và hai dòng tháp mới. Đó là chủ ý, không phải nhượng bộ.
 */

import type { TowerTypeId } from './towers';

export type UpgradeBranch = 'economy' | 'damage' | 'utility' | 'unlock';

export type UpgradeNodeId =
  | 'startGold' | 'bounty' | 'waveInterest'
  | 'arrowDamage' | 'cannonSplash' | 'frostDepth'
  | 'startLives' | 'buildCost' | 'sellRatio'
  | 'unlockBolt' | 'unlockVenom';

export type UpgradeEffect =
  /** Cộng thẳng vào vàng khởi đầu, mỗi bậc. */
  | { kind: 'startGold'; perLevel: number }
  /** Cộng phần trăm vào vàng nhận từ enemy, mỗi bậc. */
  | { kind: 'bounty'; pctPerLevel: number }
  /** Cộng phần trăm số vàng đang giữ, trả sau mỗi đợt. */
  | { kind: 'waveInterest'; pctPerLevel: number }
  /** Cộng phần trăm sát thương của một dòng tháp, mỗi bậc. */
  | { kind: 'towerDamage'; towerId: TowerTypeId; pctPerLevel: number }
  /** Cộng phần trăm bán kính nổ lan của một dòng tháp, mỗi bậc. */
  | { kind: 'splashRadius'; towerId: TowerTypeId; pctPerLevel: number }
  /** Làm chậm sâu hơn: giảm `slowFactor` theo tỉ lệ tương đối, mỗi bậc. */
  | { kind: 'slowDepth'; towerId: TowerTypeId; pctPerLevel: number }
  /** Cộng thẳng vào số mạng khởi đầu, mỗi bậc. */
  | { kind: 'startLives'; perLevel: number }
  /** Giảm phần trăm giá xây mọi tháp, mỗi bậc. Nhân dồn. */
  | { kind: 'buildCost'; pctPerLevel: number }
  /** Đặt tỉ lệ thu về khi bán (giá trị tuyệt đối, không cộng dồn). */
  | { kind: 'sellRatio'; value: number }
  /** Mở một dòng tháp mới. */
  | { kind: 'unlockTower'; towerId: TowerTypeId };

export type UpgradeNode = {
  id: UpgradeNodeId;
  branch: UpgradeBranch;
  maxLevel: number;
  /** `costs[i]` là giá để đi từ bậc i lên bậc i+1. Độ dài = maxLevel. */
  costs: number[];
  /** Phải đạt các bậc này trước khi mua được bậc đầu tiên của node này. */
  prereq: { id: UpgradeNodeId; level: number }[];
  effect: UpgradeEffect;
};

export const UPGRADE_TREE: Record<UpgradeNodeId, UpgradeNode> = {
  // ── Kinh tế ────────────────────────────────────────────────────────────────
  startGold: {
    id: 'startGold', branch: 'economy', maxLevel: 4,
    costs: [60, 110, 180, 270], prereq: [],
    effect: { kind: 'startGold', perLevel: 50 },
  },
  bounty: {
    id: 'bounty', branch: 'economy', maxLevel: 3,
    costs: [80, 140, 220], prereq: [],
    effect: { kind: 'bounty', pctPerLevel: 5 },
  },
  waveInterest: {
    id: 'waveInterest', branch: 'economy', maxLevel: 2,
    costs: [220, 360], prereq: [{ id: 'bounty', level: 2 }],
    effect: { kind: 'waveInterest', pctPerLevel: 3 },
  },

  // ── Sát thương ─────────────────────────────────────────────────────────────
  arrowDamage: {
    id: 'arrowDamage', branch: 'damage', maxLevel: 4,
    costs: [70, 120, 190, 290], prereq: [],
    effect: { kind: 'towerDamage', towerId: 'arrow', pctPerLevel: 4 },
  },
  cannonSplash: {
    id: 'cannonSplash', branch: 'damage', maxLevel: 3,
    costs: [110, 180, 280], prereq: [],
    effect: { kind: 'splashRadius', towerId: 'cannon', pctPerLevel: 4 },
  },
  frostDepth: {
    id: 'frostDepth', branch: 'damage', maxLevel: 3,
    costs: [140, 230, 350], prereq: [{ id: 'arrowDamage', level: 2 }],
    effect: { kind: 'slowDepth', towerId: 'frost', pctPerLevel: 5 },
  },

  // ── Tiện ích ───────────────────────────────────────────────────────────────
  startLives: {
    id: 'startLives', branch: 'utility', maxLevel: 3,
    costs: [100, 170, 260], prereq: [],
    effect: { kind: 'startLives', perLevel: 2 },
  },
  buildCost: {
    id: 'buildCost', branch: 'utility', maxLevel: 3,
    costs: [85, 150, 240], prereq: [],
    effect: { kind: 'buildCost', pctPerLevel: 5 },
  },
  sellRatio: {
    id: 'sellRatio', branch: 'utility', maxLevel: 1,
    costs: [190], prereq: [{ id: 'buildCost', level: 1 }],
    effect: { kind: 'sellRatio', value: 0.75 },
  },

  // ── Mở khoá ────────────────────────────────────────────────────────────────
  unlockBolt: {
    id: 'unlockBolt', branch: 'unlock', maxLevel: 1,
    costs: [300], prereq: [{ id: 'arrowDamage', level: 3 }],
    effect: { kind: 'unlockTower', towerId: 'bolt' },
  },
  unlockVenom: {
    id: 'unlockVenom', branch: 'unlock', maxLevel: 1,
    costs: [450], prereq: [{ id: 'unlockBolt', level: 1 }],
    effect: { kind: 'unlockTower', towerId: 'venom' },
  },
};

export const UPGRADE_NODE_IDS = Object.keys(UPGRADE_TREE) as UpgradeNodeId[];

/** Thứ tự hiện trên UI, theo nhánh. */
export const BRANCH_ORDER: UpgradeBranch[] = ['economy', 'damage', 'utility', 'unlock'];

export const nodesInBranch = (b: UpgradeBranch): UpgradeNode[] =>
  UPGRADE_NODE_IDS.map((id) => UPGRADE_TREE[id]).filter((n) => n.branch === b);

/** Tổng số lõi để mua hết cả cây. Dùng cho thanh "đã đầu tư x / y". */
export const TOTAL_TREE_COST = UPGRADE_NODE_IDS.reduce(
  (sum, id) => sum + UPGRADE_TREE[id].costs.reduce((a, b) => a + b, 0),
  0,
);
