import { pathAt } from '../path';
import { pickTarget } from '../targeting';
import { PROJECTILE_SPEED } from '../types';
import type { Battle } from '../battle';

/**
 * BƯỚC 3 của một tick — tháp ngắm và bắn.
 *
 * Tháp không có mục tiêu trong tầm thì `cooldown` GIỮ ở 0, nên nó bắn ngay tick
 * mục tiêu đầu tiên xuất hiện thay vì phải chờ thêm một nhịp hồi.
 */
export function stepFire(battle: Battle): void {
  const { state, map, rules, path } = battle;

  for (const tower of state.towers) {
    if (tower.cooldown > 0) {
      tower.cooldown--;
      continue;
    }

    const target = pickTarget(battle, tower);
    if (!target) {
      tower.targetId = null;
      continue;
    }

    const type = rules.towers[tower.typeId];
    const lv = type.levels[tower.level - 1];
    const slot = map.slots[tower.slotIndex];
    const at = pathAt(path, target.s);

    tower.targetId = target.id;
    state.projectiles.push({
      id: state.nextId++,
      ownerTypeId: tower.typeId,
      x: slot.x,
      y: slot.y,
      targetId: target.id,
      lastKnownX: at.x,
      lastKnownY: at.y,
      speed: PROJECTILE_SPEED,
      damage: lv.damage,
      splashRadius: lv.splashRadius,
      pierceArmor: type.pierceArmor,
      slowFactor: lv.slowFactor,
      slowTicks: lv.slowTicks,
    });
    tower.cooldown = lv.cooldownTicks;
  }
}
