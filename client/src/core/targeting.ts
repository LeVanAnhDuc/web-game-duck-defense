import { pathAt } from './path';
import type { Battle } from './battle';
import type { Enemy, Tower } from './types';

/**
 * Chọn mục tiêu cho một tháp, hoặc `null` nếu không có gì trong tầm.
 *
 * Mặc định là `first` — enemy đi XA NHẤT trong tầm, tức `max(s)`. Đây là lý do
 * `invariants.md` #2 tồn tại: với `s` thì luật này là một phép max; với `{x, y}`
 * thì phải đoán.
 *
 * Khoảng cách so bằng BÌNH PHƯƠNG, không gọi `Math.sqrt` — hàm này chạy cho
 * mỗi tháp mỗi tick.
 */
export function pickTarget(battle: Battle, tower: Tower): Enemy | null {
  const { state, map, rules, path } = battle;
  const type = rules.towers[tower.typeId];
  const lv = type.levels[tower.level - 1];
  const slot = map.slots[tower.slotIndex];

  let best: Enemy | null = null;
  let bestKey = -Infinity;

  for (const e of state.enemies) {
    const p = pathAt(path, e.s);
    const dx = p.x - slot.x;
    const dy = p.y - slot.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > lv.rangeSq) continue;

    let key: number;
    switch (type.targeting) {
      case 'first': key = e.s; break;
      case 'last': key = -e.s; break;
      case 'strongest': key = e.hp; break;
      case 'closest': key = -d2; break;
    }

    if (key > bestKey) {
      bestKey = key;
      best = e;
    }
  }

  return best;
}
