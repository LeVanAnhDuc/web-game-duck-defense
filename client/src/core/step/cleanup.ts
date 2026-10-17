import { ENEMIES } from '../../data/enemies';
import { bountyFor, waveInterest } from '../economy';
import type { Battle } from '../battle';

/**
 * BƯỚC 5 của một tick — dọn xác, trả vàng, xét kết thúc đợt và kết thúc trận.
 *
 * Đợt xong khi lịch đã sinh hết VÀ bản đồ sạch enemy. Chỉ một trong hai là chưa
 * xong: sinh hết mà còn enemy trên đường thì người chơi vẫn có thể thua.
 */
export function stepCleanup(battle: Battle): void {
  const { state, map, rules } = battle;

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.hp > 0) continue;
    const gain = bountyFor(rules, ENEMIES[e.typeId].bounty);
    state.gold += gain;
    state.stats.goldEarned += gain;
    state.stats.killed++;
    state.enemies.splice(i, 1);
  }

  if (state.phase !== 'wave') return;

  const schedule = map.waves[state.waveIndex];
  const doneSpawning = state.spawnCursor >= schedule.length;
  if (!doneSpawning || state.enemies.length > 0) return;

  const interest = waveInterest(rules, state.gold);
  state.gold += interest;
  state.stats.goldEarned += interest;

  if (state.waveIndex >= map.waves.length - 1) {
    state.phase = 'won';
    return;
  }
  state.waveIndex++;
  state.phase = 'prep';
}
