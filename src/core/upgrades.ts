/**
 * Đổi trạng thái cây nâng cấp thành một bộ luật đã giải cho MỘT trận.
 *
 * Hàm này được gọi ĐÚNG MỘT LẦN, lúc `createBattle`. `step()` không bao giờ đọc
 * `UpgradeState` — xem `invariants.md` #8. Áp lại giữa trận sẽ làm mua nâng cấp
 * trong lúc đang chơi đổi tháp đã xây, và số liệu trận không còn tái tạo được.
 *
 * Nó cũng KHÔNG BAO GIỜ sửa `TOWERS` — bảng gốc là hằng (`invariants.md` #6).
 * Một trận sửa số liệu thì trận sau kế thừa, và bug chỉ hiện ở trận thứ hai.
 */

import { TOWERS, type TowerType, type TowerTypeId } from '../data/towers';
import { UPGRADE_NODE_IDS, UPGRADE_TREE, type UpgradeNodeId } from '../data/upgradeTree';

/** Bậc hiện có của từng node. Node không có mặt = bậc 0. */
export type UpgradeState = Partial<Record<UpgradeNodeId, number>>;

export type ResolvedRules = {
  /** Bản CLONE của bảng tháp, đã áp hiệu ứng. Không phải `TOWERS`. */
  towers: Record<TowerTypeId, TowerType>;
  startGold: number;
  startLives: number;
  bountyMultiplier: number;
  buildCostMultiplier: number;
  sellRatio: number;
  /** Phần trăm vàng đang giữ được trả thêm sau mỗi đợt. 0 = không có. */
  waveInterestPct: number;
  unlockedTowers: TowerTypeId[];
};

const levelOf = (u: UpgradeState, id: UpgradeNodeId): number => {
  const raw = u[id];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(UPGRADE_TREE[id].maxLevel, Math.floor(raw)));
};

function cloneTowers(): Record<TowerTypeId, TowerType> {
  const out = {} as Record<TowerTypeId, TowerType>;
  for (const id of Object.keys(TOWERS) as TowerTypeId[]) {
    const t = TOWERS[id];
    out[id] = { ...t, levels: t.levels.map((lv) => ({ ...lv })) };
  }
  return out;
}

export function applyUpgrades(upgrades: UpgradeState): ResolvedRules {
  const towers = cloneTowers();
  const unlocked = new Set<TowerTypeId>(
    (Object.keys(towers) as TowerTypeId[]).filter((id) => towers[id].unlockedAtStart),
  );

  let startGoldBonus = 0;
  let startLivesBonus = 0;
  let bountyMultiplier = 1;
  let buildCostMultiplier = 1;
  let sellRatio = 0.5;
  let waveInterestPct = 0;

  for (const nodeId of UPGRADE_NODE_IDS) {
    const level = levelOf(upgrades, nodeId);
    if (level === 0) continue;
    const { effect } = UPGRADE_TREE[nodeId];

    switch (effect.kind) {
      case 'startGold':
        startGoldBonus += effect.perLevel * level;
        break;
      case 'startLives':
        startLivesBonus += effect.perLevel * level;
        break;
      case 'bounty':
        bountyMultiplier += (effect.pctPerLevel / 100) * level;
        break;
      case 'waveInterest':
        waveInterestPct += effect.pctPerLevel * level;
        break;
      case 'buildCost':
        // Nhân dồn, không cộng dồn: ba bậc 5% ra 0.857 chứ không ra 0.85.
        buildCostMultiplier *= Math.pow(1 - effect.pctPerLevel / 100, level);
        break;
      case 'sellRatio':
        sellRatio = effect.value;
        break;
      case 'towerDamage': {
        const factor = 1 + (effect.pctPerLevel / 100) * level;
        for (const lv of towers[effect.towerId].levels) {
          lv.damage = Math.round(lv.damage * factor);
        }
        break;
      }
      case 'splashRadius': {
        const factor = 1 + (effect.pctPerLevel / 100) * level;
        for (const lv of towers[effect.towerId].levels) {
          if (lv.splashRadius > 0) lv.splashRadius = Math.round(lv.splashRadius * factor);
        }
        break;
      }
      case 'slowDepth': {
        const factor = 1 - (effect.pctPerLevel / 100) * level;
        for (const lv of towers[effect.towerId].levels) {
          if (lv.slowFactor < 1) lv.slowFactor = Math.max(0.15, lv.slowFactor * factor);
        }
        break;
      }
      case 'unlockTower':
        unlocked.add(effect.towerId);
        break;
    }
  }

  return {
    towers,
    startGold: startGoldBonus,
    startLives: startLivesBonus,
    bountyMultiplier,
    buildCostMultiplier,
    sellRatio,
    waveInterestPct,
    unlockedTowers: (Object.keys(towers) as TowerTypeId[]).filter((id) => unlocked.has(id)),
  };
}

/** Trạng thái cây mua hết mọi bậc. Dùng cho test trần sức mạnh. */
export function fullUpgradeState(): UpgradeState {
  const out: UpgradeState = {};
  for (const id of UPGRADE_NODE_IDS) out[id] = UPGRADE_TREE[id].maxLevel;
  return out;
}

/**
 * Hệ số tổng lực mà cây nâng cấp mang lại, so với cây trống.
 *
 * Đây là con số mà `design.md` §4 đặt trần +60% cho. Nó nhân ba nguồn lực thật
 * sự cộng dồn với nhau: sát thương của dòng tháp mạnh nhất, kích thước nổ lan,
 * và thu nhập. Ba thứ này nhân nhau vì chúng nhân nhau trong trận: nhiều vàng
 * hơn nghĩa là nhiều tháp hơn, mỗi tháp lại mạnh hơn.
 */
export function totalPowerFactor(upgrades: UpgradeState): number {
  const base = applyUpgrades({});
  const up = applyUpgrades(upgrades);

  const dmg = (r: ResolvedRules) =>
    Math.max(...(Object.keys(r.towers) as TowerTypeId[]).map((id) => {
      const lvls = r.towers[id].levels;
      return lvls[lvls.length - 1].damage / TOWERS[id].levels[TOWERS[id].levels.length - 1].damage;
    }));

  const splash = (r: ResolvedRules) => {
    const lvls = r.towers.cannon.levels;
    const baseLvls = TOWERS.cannon.levels;
    return lvls[lvls.length - 1].splashRadius / baseLvls[baseLvls.length - 1].splashRadius;
  };

  const damageFactor = dmg(up) / dmg(base);
  // Bán kính nổ lan tăng r lần thì diện tích quét tăng ~r lần theo chiều dài
  // đường đi, không phải r² — enemy đi thành hàng trên một đường, không rải đều
  // trên mặt phẳng.
  const splashFactor = splash(up) / splash(base);
  const incomeFactor = up.bountyMultiplier / base.bountyMultiplier;

  return damageFactor * splashFactor * incomeFactor;
}
