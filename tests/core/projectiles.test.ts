import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { effectiveDamage, stepProjectiles } from '../../src/core/step/projectiles';
import { pathAt } from '../../src/core/path';
import { PROJECTILE_SPEED } from '../../src/core/types';
import type { Projectile } from '../../src/core/types';
import { ENEMIES, type EnemyTypeId } from '../../src/data/enemies';

describe('effectiveDamage', () => {
  it('trừ giáp', () => expect(effectiveDamage(20, 6, false)).toBe(14));
  it('bỏ qua giáp khi tháp xuyên giáp', () => expect(effectiveDamage(20, 6, true)).toBe(20));
  it('có sàn 1 — giáp không làm tháp thành vô dụng tuyệt đối', () => {
    expect(effectiveDamage(4, 6, false)).toBe(1);
    expect(effectiveDamage(1, 99, false)).toBe(1);
  });
  it('giáp 0 thì sát thương nguyên vẹn', () => expect(effectiveDamage(27, 0, false)).toBe(27));
});

function scene() {
  const b = createBattle('m01', {}, 1);
  b.state.gold = 9999;
  applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
  return b;
}

type B = ReturnType<typeof createBattle>;

const addEnemy = (b: B, id: number, s: number, typeId: EnemyTypeId = 'grunt') => {
  const e = { id, typeId, s, hp: ENEMIES[typeId].hp, slowUntilTick: 0, slowFactor: 1 };
  b.state.enemies.push(e);
  return e;
};

function addProjectile(b: B, over: Partial<Projectile> & { targetId: number }): Projectile {
  const target = b.state.enemies.find((e) => e.id === over.targetId);
  const at = target ? pathAt(b.path, target.s) : { x: 0, y: 0 };
  const pr: Projectile = {
    id: b.state.nextId++,
    ownerTypeId: 'arrow',
    x: at.x, y: at.y,
    lastKnownX: at.x, lastKnownY: at.y,
    speed: PROJECTILE_SPEED,
    damage: 20, splashRadius: 0, pierceArmor: false,
    slowFactor: 1, slowTicks: 0,
    ...over,
  };
  b.state.projectiles.push(pr);
  return pr;
}

describe('stepProjectiles', () => {
  it('đạn tới sát mục tiêu thì trúng ngay tick đó và bị xoá', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200);
    addProjectile(b, { targetId: 1, damage: 20 });
    stepProjectiles(b);
    expect(b.state.projectiles).toHaveLength(0);
    expect(e.hp).toBe(ENEMIES.grunt.hp - 20);
  });

  it('đạn còn xa thì bay tiếp, chưa trúng', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200);
    const at = pathAt(b.path, 200);
    addProjectile(b, { targetId: 1, x: at.x - 300, y: at.y, damage: 20 });
    stepProjectiles(b);
    expect(b.state.projectiles).toHaveLength(1);
    expect(e.hp).toBe(ENEMIES.grunt.hp);
  });

  it('trừ giáp khi trúng enemy có giáp', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200, 'armored');
    addProjectile(b, { targetId: 1, damage: 20 });
    stepProjectiles(b);
    expect(e.hp).toBe(ENEMIES.armored.hp - (20 - ENEMIES.armored.armor));
  });

  it('nổ lan trúng mọi enemy trong bán kính, và chỉ trong bán kính', () => {
    const b = scene();
    const centre = addEnemy(b, 1, 200);
    const at = pathAt(b.path, 200);
    // tìm một s khác mà điểm trên đường nằm trong 30 đơn vị của `at`
    let sNear = -1;
    let sFar = -1;
    for (let s = 0; s <= b.path.length; s += 1) {
      const p = pathAt(b.path, s);
      const d = Math.hypot(p.x - at.x, p.y - at.y);
      if (sNear === -1 && d > 5 && d < 25) sNear = s;
      if (sFar === -1 && d > 120) sFar = s;
    }
    const near = addEnemy(b, 2, sNear);
    const far = addEnemy(b, 3, sFar);

    addProjectile(b, { targetId: 1, damage: 20, splashRadius: 30 });
    stepProjectiles(b);

    expect(centre.hp).toBeLessThan(ENEMIES.grunt.hp);
    expect(near.hp).toBeLessThan(ENEMIES.grunt.hp);
    expect(far.hp).toBe(ENEMIES.grunt.hp);
  });

  it('mục tiêu chết giữa đường bay: đạn vẫn nổ ở vị trí biết được lần cuối', () => {
    const b = scene();
    addEnemy(b, 1, 200);
    const at = pathAt(b.path, 200);
    const collateral = addEnemy(b, 2, 200);

    // đạn còn cách 300 đơn vị, mục tiêu biến mất ngay sau đó
    addProjectile(b, { targetId: 1, x: at.x - 300, y: at.y, damage: 20, splashRadius: 30 });
    b.state.enemies = b.state.enemies.filter((e) => e.id !== 1);

    // bay tới rồi nổ — nhiều tick vì 300 đơn vị
    for (let i = 0; i < 60 && b.state.projectiles.length > 0; i++) stepProjectiles(b);

    expect(b.state.projectiles).toHaveLength(0);
    expect(collateral.hp).toBeLessThan(ENEMIES.grunt.hp);
  });

  it('đạn đơn mục tiêu mất mục tiêu thì nổ mà không gây sát thương cho ai', () => {
    const b = scene();
    addEnemy(b, 1, 200);
    const other = addEnemy(b, 2, 200);
    addProjectile(b, { targetId: 1, damage: 20, splashRadius: 0 });
    b.state.enemies = b.state.enemies.filter((e) => e.id !== 1);
    stepProjectiles(b);
    expect(b.state.projectiles).toHaveLength(0);
    expect(other.hp).toBe(ENEMIES.grunt.hp);
  });

  it('làm chậm KHÔNG cộng dồn: hai phát chỉ lấy hệ số mạnh nhất', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200);
    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.6, slowTicks: 90 });
    stepProjectiles(b);
    expect(e.slowFactor).toBeCloseTo(0.6, 6);

    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.6, slowTicks: 90 });
    stepProjectiles(b);
    expect(e.slowFactor).toBeCloseTo(0.6, 6); // không thành 0.36
  });

  it('làm chậm mạnh hơn thì thay thế, và làm mới thời hạn', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200);
    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.6, slowTicks: 90 });
    stepProjectiles(b);
    b.state.tick = 50;
    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.44, slowTicks: 130 });
    stepProjectiles(b);
    expect(e.slowFactor).toBeCloseTo(0.44, 6);
    expect(e.slowUntilTick).toBe(50 + 130);
  });

  it('làm chậm yếu hơn KHÔNG ghi đè hệ số đang có, nhưng vẫn làm mới thời hạn', () => {
    const b = scene();
    const e = addEnemy(b, 1, 200);
    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.44, slowTicks: 90 });
    stepProjectiles(b);
    b.state.tick = 30;
    addProjectile(b, { targetId: 1, damage: 1, slowFactor: 0.62, slowTicks: 90 });
    stepProjectiles(b);
    expect(e.slowFactor).toBeCloseTo(0.44, 6);
    expect(e.slowUntilTick).toBe(30 + 90);
  });
});
