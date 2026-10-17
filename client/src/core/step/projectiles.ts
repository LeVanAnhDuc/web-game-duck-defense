import { ENEMIES } from '../../data/enemies';
import { pathAt } from '../path';
import { FIXED_DT } from '../types';
import type { Battle } from '../battle';
import type { Enemy, Projectile } from '../types';

/**
 * Sát thương thực sau khi trừ giáp.
 *
 * SÀN 1 là cố ý: giáp không bao giờ làm một loại tháp thành vô dụng tuyệt đối.
 * Không có sàn thì tháp Băng (sát thương 4) gặp enemy giáp 6 sẽ gây 0 và người
 * chơi không hiểu vì sao tháp mình "không bắn".
 */
export function effectiveDamage(damage: number, armor: number, pierce: boolean): number {
  return Math.max(1, pierce ? damage : damage - armor);
}

/**
 * BƯỚC 4 của một tick — đạn bay và trúng.
 *
 * Mục tiêu chết TRƯỚC KHI đạn tới thì đạn vẫn bay tới vị trí biết được lần cuối
 * rồi nổ ở đó. Nếu không, một phát đạn nổ lan bị mất trắng bởi một cú giết mà nó
 * không gây ra — `design.md` §2 bước 4.
 */
export function stepProjectiles(battle: Battle): void {
  const { state, path } = battle;

  // Một Map cho cả bước, thay vì `find` lồng trong vòng lặp: với 60 enemy và
  // 40 viên đạn thì đó là 2400 lần so sánh mỗi tick, không cần thiết.
  const byId = new Map<number, Enemy>();
  for (const e of state.enemies) byId.set(e.id, e);

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const pr = state.projectiles[i];

    const target = byId.get(pr.targetId);
    if (target) {
      const at = pathAt(path, target.s);
      pr.lastKnownX = at.x;
      pr.lastKnownY = at.y;
    }

    const dx = pr.lastKnownX - pr.x;
    const dy = pr.lastKnownY - pr.y;
    const dist = Math.hypot(dx, dy);
    const travel = pr.speed * FIXED_DT;

    if (dist > travel) {
      pr.x += (dx / dist) * travel;
      pr.y += (dy / dist) * travel;
      continue;
    }

    pr.x = pr.lastKnownX;
    pr.y = pr.lastKnownY;
    detonate(battle, pr, byId);
    state.projectiles.splice(i, 1);
  }
}

function detonate(battle: Battle, pr: Projectile, byId: Map<number, Enemy>): void {
  const { state, path } = battle;
  const hit: Enemy[] = [];

  if (pr.splashRadius > 0) {
    const r2 = pr.splashRadius * pr.splashRadius;
    for (const e of state.enemies) {
      const at = pathAt(path, e.s);
      const dx = at.x - pr.x;
      const dy = at.y - pr.y;
      if (dx * dx + dy * dy <= r2) hit.push(e);
    }
  } else {
    const t = byId.get(pr.targetId);
    if (t) hit.push(t);
  }

  for (const e of hit) {
    e.hp -= effectiveDamage(pr.damage, ENEMIES[e.typeId].armor, pr.pierceArmor);

    if (pr.slowTicks > 0 && pr.slowFactor < 1) {
      // KHÔNG cộng dồn (FR-20): lấy hệ số MẠNH NHẤT trong các nguồn, và làm mới
      // thời hạn. Nhân dồn thì hai tháp Băng sẽ đóng băng vĩnh viễn cả bản đồ.
      const stillActive = state.tick < e.slowUntilTick;
      const existing = stillActive ? e.slowFactor : 1;
      e.slowFactor = Math.min(existing, pr.slowFactor);
      e.slowUntilTick = state.tick + pr.slowTicks;
    }
  }
}
