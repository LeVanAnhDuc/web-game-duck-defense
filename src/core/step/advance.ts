import { ENEMIES } from '../../data/enemies';
import { FIXED_DT } from '../types';
import type { Battle } from '../battle';

/**
 * BƯỚC 2 của một tick — enemy tiến trên đường.
 *
 * Bước này PHẢI chạy trước bước 3 (tháp bắn). Đảo lại thì mọi phát bắn nhắm
 * vị trí của frame trước — `invariants.md` #1.
 */
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
      if (state.lives === 0) {
        state.phase = 'lost';
        return;
      }
    }
  }
}
