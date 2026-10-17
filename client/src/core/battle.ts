import { MAPS, type MapDef, type MapId } from '../data/maps';
import { TOWERS, type TowerTypeId } from '../data/towers';
import { buildCost, sellValue, upgradeCostOf } from './economy';
import { buildPath, type Path } from './path';
import { makeRng } from './rng';
import type { BattleState, EntityId } from './types';
import { applyUpgrades, type ResolvedRules, type UpgradeState } from './upgrades';

export type Battle = {
  state: BattleState;
  map: MapDef;
  path: Path;
  /** Luật đã giải từ cây nâng cấp. Giải MỘT LẦN ở đây — `invariants.md` #8. */
  rules: ResolvedRules;
};

/**
 * Ý định của người chơi.
 *
 * UI đẩy ý định, không bao giờ đẩy state (ADR-0004). Ý định được áp ở RANH GIỚI
 * TICK, không phải ngay lúc chạm (`invariants.md` #5).
 */
export type Intent =
  | { kind: 'build'; slotIndex: number; towerId: TowerTypeId }
  | { kind: 'upgrade'; towerId: EntityId }
  | { kind: 'sell'; towerId: EntityId }
  | { kind: 'startWave' }
  | { kind: 'select'; target: { kind: 'slot'; slotIndex: number } | { kind: 'tower'; towerId: EntityId } | null };

export function createBattle(mapId: MapId, upgrades: UpgradeState, seed: number): Battle {
  const map = MAPS[mapId];
  const rules = applyUpgrades(upgrades);

  const state: BattleState = {
    tick: 0,
    phase: 'prep',
    gold: map.startGold + rules.startGold,
    lives: map.startLives + rules.startLives,
    waveIndex: 0,
    spawnCursor: 0,
    spawnedFromCursor: 0,
    spawnTimer: 0,
    enemies: [],
    towers: [],
    projectiles: [],
    rng: makeRng(seed),
    nextId: 1,
    stats: { killed: 0, leaked: 0, goldEarned: 0 },
  };

  return { state, map, path: buildPath(map.waypoints), rules };
}

const slotOccupied = (b: Battle, slotIndex: number): boolean =>
  b.state.towers.some((t) => t.slotIndex === slotIndex);

/**
 * Áp một ý định. Thay đổi `battle` tại chỗ, không trả về gì.
 *
 * Mọi guard không đạt là một `return` IM LẶNG — UI đã vô hiệu hoá nút, và đây
 * là cửa thứ hai (`design.md` §5). Không có đường nào để UI làm `core/` vào
 * state sai.
 */
export function applyIntent(battle: Battle, intent: Intent): void {
  const { state, map, rules } = battle;
  if (state.phase === 'won' || state.phase === 'lost') return;

  switch (intent.kind) {
    case 'build': {
      if (intent.slotIndex < 0 || intent.slotIndex >= map.slots.length) return;
      if (slotOccupied(battle, intent.slotIndex)) return;
      if (!TOWERS[intent.towerId]) return;
      if (!rules.unlockedTowers.includes(intent.towerId)) return;
      const cost = buildCost(rules, intent.towerId);
      if (state.gold < cost) return;

      state.gold -= cost;
      state.towers.push({
        id: state.nextId++,
        typeId: intent.towerId,
        slotIndex: intent.slotIndex,
        level: 1,
        cooldown: 0,
        targetId: null,
      });
      return;
    }

    case 'upgrade': {
      const tower = state.towers.find((t) => t.id === intent.towerId);
      if (!tower) return;
      const cost = upgradeCostOf(rules, tower.typeId, tower.level);
      if (cost === null) return; // đã ở bậc cuối
      if (state.gold < cost) return;

      state.gold -= cost;
      tower.level += 1;
      // Bậc mới có cooldown khác; không tặng một phát bắn miễn phí.
      tower.cooldown = Math.min(
        tower.cooldown,
        rules.towers[tower.typeId].levels[tower.level - 1].cooldownTicks,
      );
      return;
    }

    case 'sell': {
      const index = state.towers.findIndex((t) => t.id === intent.towerId);
      if (index === -1) return;
      const tower = state.towers[index];
      state.gold += sellValue(rules, tower.typeId, tower.level);
      state.towers.splice(index, 1);
      // Đạn đang bay của tháp vừa bán vẫn bay tiếp — nó đã rời nòng.
      return;
    }

    case 'startWave': {
      if (state.phase !== 'prep') return;
      if (state.waveIndex >= map.waves.length) return;
      state.phase = 'wave';
      state.spawnCursor = 0;
      state.spawnedFromCursor = 0;
      state.spawnTimer = map.waves[state.waveIndex][0].delayTicks;
      return;
    }

    case 'select':
      // Chọn là state của tầng hiển thị, không phải của mô phỏng. `core/` bỏ qua.
      return;
  }
}
