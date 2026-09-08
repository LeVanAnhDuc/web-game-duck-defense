import { applyIntent, createBattle } from '../../src/core/battle';
import { buildCost, upgradeCostOf } from '../../src/core/economy';
import { MAPS, type MapId } from '../../src/data/maps';
import { step } from '../../src/core/step';
import type { UpgradeState } from '../../src/core/upgrades';
import type { BattleOutcome } from '../../src/core/runBattle';

/**
 * Người chơi tham lam, bị RÀNG BUỘC BỞI KINH TẾ.
 *
 * `runBattle` cấp bố cục tham chiếu miễn phí, nên nó chỉ trả lời "bố cục này có
 * đủ mạnh không". Câu hỏi thật hơn là "người chơi có KỊP dựng nó không" — và đó
 * là câu mà một bản đồ bất khả thi sẽ trượt.
 *
 * Người chơi này đi đúng theo `referenceLayout` (thứ tự trong đó là thứ tự ưu
 * tiên do người thiết kế bản đồ chọn), nhưng chỉ tiêu số vàng nó thật sự kiếm
 * được: dựng tháp còn thiếu ngay khi đủ tiền, rồi nâng dần từng tháp lên đúng
 * bậc trong bố cục. Mỗi lần gọi làm TỐI ĐA MỘT hành động, nên vàng tích luỹ
 * theo đúng nhịp của trận.
 *
 * Đây là hạ tầng test, không phải code game — nó sống trong `tests/` cố ý.
 */
export function runBattleAffordable(
  mapId: MapId,
  upgrades: UpgradeState,
  seed: number,
  maxTicks = 200_000,
): BattleOutcome {
  const b = createBattle(mapId, upgrades, seed);
  const plan = MAPS[mapId].referenceLayout;

  let ticks = 0;
  while (b.state.phase !== 'won' && b.state.phase !== 'lost' && ticks < maxTicks) {
    spendOnce(b, plan);
    if (b.state.phase === 'prep') applyIntent(b, { kind: 'startWave' });
    step(b);
    ticks++;
  }

  return {
    won: b.state.phase === 'won',
    waveReached: Math.min(b.state.waveIndex + 1, MAPS[mapId].waves.length),
    ticks,
    livesLeft: b.state.lives,
    goldEarned: b.state.stats.goldEarned,
    killed: b.state.stats.killed,
    leaked: b.state.stats.leaked,
  };
}

type Battle = ReturnType<typeof createBattle>;

function spendOnce(b: Battle, plan: (typeof MAPS)[MapId]['referenceLayout']): void {
  // 1. Dựng tháp còn thiếu, theo thứ tự ưu tiên của bố cục.
  for (const p of plan) {
    const existing = b.state.towers.find((t) => t.slotIndex === p.slotIndex);
    if (existing) continue;
    const cost = buildCost(b.rules, p.towerId);
    if (b.state.gold >= cost) {
      applyIntent(b, { kind: 'build', slotIndex: p.slotIndex, towerId: p.towerId });
    }
    return; // chờ đủ tiền cho tháp này, không nhảy sang tháp rẻ hơn phía sau
  }

  // 2. Đủ tháp rồi thì nâng dần lên đúng bậc trong bố cục.
  for (const p of plan) {
    const t = b.state.towers.find((x) => x.slotIndex === p.slotIndex);
    if (!t || t.level >= p.level) continue;
    const cost = upgradeCostOf(b.rules, t.typeId, t.level);
    if (cost !== null && b.state.gold >= cost) {
      applyIntent(b, { kind: 'upgrade', towerId: t.id });
    }
    return;
  }
}
