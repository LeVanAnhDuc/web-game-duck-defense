import { MAPS, type MapDef, type MapId } from '../data/maps';
import { applyIntent, createBattle } from './battle';
import { step } from './step';
import type { UpgradeState } from './upgrades';

export type BattleOutcome = {
  won: boolean;
  /** Số đợt đã sống sót, 1-based. Thua ở đợt 9 thì bằng 9. */
  waveReached: number;
  ticks: number;
  livesLeft: number;
  goldEarned: number;
  killed: number;
  leaked: number;
};

/**
 * Mức nâng cấp thấp nhất người chơi có thể có lúc một bản đồ vừa mở.
 *
 * Trả về CÂY TRỐNG cho mọi bản đồ, và đó là lựa chọn có ý thức: người chơi có
 * thể tích trữ `cores` mà không mua gì, nên mức thấp nhất thật sự là không có
 * gì. Ràng buộc mạnh hơn phương án "ngân sách đã tiêu", và nó cho một đảm bảo
 * tuyệt đối: KHÔNG người chơi nào có thể bị kẹt, vì mọi bản đồ đều thắng được
 * mà không cần một bậc nâng cấp nào.
 *
 * Hệ quả về thiết kế: cây nâng cấp là hệ thống làm cho dễ chịu hơn, không phải
 * điều kiện để đi tiếp. Điều đó khớp với trần +60% trong `design.md` §4.
 *
 * Hàm này giữ nguyên chữ ký để nếu về sau có bản đồ cần mức sàn khác thì chỉ
 * sửa ở đây, không sửa test.
 */
export function minUpgradesForMap(_mapId: MapId): UpgradeState {
  return {};
}

/**
 * Chạy trọn một trận, không cần trình duyệt (FR-31).
 *
 * `layout` được cấp miễn phí: mục đích của hàm này là đo xem một BỐ CỤC có
 * thắng được không, không phải đo xem người chơi có kiếm đủ vàng để dựng nó
 * không. Kinh tế thật được trả lại ngay sau khi dựng xong.
 */
export function runBattle(
  mapId: MapId,
  layout: MapDef['referenceLayout'],
  upgrades: UpgradeState,
  seed: number,
  maxTicks = 200_000,
): BattleOutcome {
  const b = createBattle(mapId, upgrades, seed);

  const realGold = b.state.gold;
  b.state.gold = Number.MAX_SAFE_INTEGER;
  for (const p of layout) {
    applyIntent(b, { kind: 'build', slotIndex: p.slotIndex, towerId: p.towerId });
    const tower = b.state.towers[b.state.towers.length - 1];
    if (!tower || tower.slotIndex !== p.slotIndex) continue;
    for (let l = 1; l < p.level; l++) applyIntent(b, { kind: 'upgrade', towerId: tower.id });
  }
  b.state.gold = realGold;
  b.state.stats.goldEarned = 0;

  let ticks = 0;
  while (b.state.phase !== 'won' && b.state.phase !== 'lost' && ticks < maxTicks) {
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
