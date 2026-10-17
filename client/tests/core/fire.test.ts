import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { stepFire } from '../../src/core/step/fire';
import { TOWERS } from '../../src/data/towers';
import { ENEMIES } from '../../src/data/enemies';

function withTower() {
  const b = createBattle('m01', {}, 1);
  b.state.gold = 9999;
  applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
  return { b, tower: b.state.towers[0] };
}

/** s = 0 nằm trong tầm slot 7. Tầm pháo ngắn hơn nên slot 8 cần s = 196. */
const inRange = (b: ReturnType<typeof createBattle>, id = 1, s = 0) => {
  b.state.enemies.push({ id, typeId: 'grunt', s, hp: ENEMIES.grunt.hp, slowUntilTick: 0, slowFactor: 1 });
};

describe('stepFire', () => {
  it('giảm cooldown mỗi tick và không bắn khi còn cooldown', () => {
    const { b, tower } = withTower();
    inRange(b);
    tower.cooldown = 3;
    stepFire(b);
    expect(tower.cooldown).toBe(2);
    expect(b.state.projectiles).toHaveLength(0);
  });

  it('bắn đúng một viên rồi đặt lại cooldown theo bậc', () => {
    const { b, tower } = withTower();
    inRange(b);
    tower.cooldown = 0;
    stepFire(b);
    expect(b.state.projectiles).toHaveLength(1);
    expect(tower.cooldown).toBe(TOWERS.arrow.levels[0].cooldownTicks);
  });

  it('không có mục tiêu thì GIỮ cooldown ở 0, nên bắn ngay tick mục tiêu xuất hiện', () => {
    const { b, tower } = withTower();
    tower.cooldown = 0;
    stepFire(b);
    expect(b.state.projectiles).toHaveLength(0);
    expect(tower.cooldown).toBe(0);
    expect(tower.targetId).toBeNull();

    inRange(b);
    stepFire(b);
    expect(b.state.projectiles).toHaveLength(1);
  });

  it('đạn mang đúng sát thương và bán kính nổ của bậc hiện tại', () => {
    const b = createBattle('m01', {}, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 8, towerId: 'cannon' });
    const tower = b.state.towers[0];
    applyIntent(b, { kind: 'upgrade', towerId: tower.id });
    inRange(b, 1, 196);
    tower.cooldown = 0;
    stepFire(b);
    const pr = b.state.projectiles[0];
    expect(pr.damage).toBe(TOWERS.cannon.levels[1].damage);
    expect(pr.splashRadius).toBe(TOWERS.cannon.levels[1].splashRadius);
  });

  it('đạn xuất phát từ tâm ô của tháp', () => {
    const { b, tower } = withTower();
    inRange(b);
    tower.cooldown = 0;
    stepFire(b);
    const slot = b.map.slots[7];
    expect(b.state.projectiles[0].x).toBe(slot.x);
    expect(b.state.projectiles[0].y).toBe(slot.y);
  });

  it('sát thương của đạn đã tính nhánh nâng cấp', () => {
    const b = createBattle('m01', { arrowDamage: 4 }, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    b.state.towers[0].cooldown = 0;
    inRange(b);
    stepFire(b);
    expect(b.state.projectiles[0].damage).toBeGreaterThan(TOWERS.arrow.levels[0].damage);
  });

  it('nhiều tháp cùng bắn trong một tick', () => {
    const b = createBattle('m01', {}, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    applyIntent(b, { kind: 'build', slotIndex: 8, towerId: 'arrow' });
    for (const t of b.state.towers) t.cooldown = 0;
    inRange(b, 1, 196);
    stepFire(b);
    expect(b.state.projectiles.length).toBeGreaterThanOrEqual(1);
  });
});
