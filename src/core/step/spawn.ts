import { ENEMIES } from '../../data/enemies';
import type { Battle } from '../battle';

/**
 * BƯỚC 1 của một tick — sinh enemy theo lịch đợt.
 *
 * Các phần tử trong một đợt sinh TUẦN TỰ: hết `count` con của phần tử này, chờ
 * `delayTicks` của phần tử kế, rồi mới sinh phần tử kế. Một đợt vì thế là một
 * chuỗi nhóm, không phải nhiều nhóm chồng nhau.
 *
 * QUY ƯỚC ĐẾM, và nó là chỗ sinh ra off-by-one nếu đọc sai:
 *   • `spawnTimer` là số tick CÒN LẠI trước lần sinh kế tiếp.
 *   • `delayTicks` của phần tử đầu đếm TỪ LÚC ĐỢT BẮT ĐẦU, nên `startWave` đặt
 *     `spawnTimer = delayTicks` và con đầu tiên ra đúng ở tick thứ `delayTicks`.
 *   • `intervalTicks` đếm KHOẢNG CÁCH GIỮA HAI LẦN SINH, nên sau mỗi lần sinh
 *     `spawnTimer = intervalTicks - 1`: tick sinh vừa rồi đã tính là một tick
 *     của khoảng cách đó.
 */
export function stepSpawn(battle: Battle): void {
  const { state, map } = battle;
  if (state.phase !== 'wave') return;

  const schedule = map.waves[state.waveIndex];
  if (state.spawnCursor >= schedule.length) return;

  if (state.spawnTimer > 0) {
    state.spawnTimer--;
    return;
  }

  const entry = schedule[state.spawnCursor];
  const type = ENEMIES[entry.enemyId];
  state.enemies.push({
    id: state.nextId++,
    typeId: entry.enemyId,
    s: 0,
    hp: type.hp,
    slowUntilTick: 0,
    slowFactor: 1,
  });
  state.spawnedFromCursor++;

  if (state.spawnedFromCursor >= entry.count) {
    state.spawnCursor++;
    state.spawnedFromCursor = 0;
    const next = schedule[state.spawnCursor];
    state.spawnTimer = next ? Math.max(0, next.delayTicks - 1) : 0;
  } else {
    state.spawnTimer = Math.max(0, entry.intervalTicks - 1);
  }
}
