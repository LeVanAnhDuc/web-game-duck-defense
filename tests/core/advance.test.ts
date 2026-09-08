import { describe, it, expect } from 'vitest';
import { createBattle } from '../../src/core/battle';
import { stepAdvance } from '../../src/core/step/advance';
import { FIXED_DT } from '../../src/core/types';
import { ENEMIES, type EnemyTypeId } from '../../src/data/enemies';

function withEnemy(o: { s?: number; typeId?: EnemyTypeId; slowUntilTick?: number; slowFactor?: number } = {}) {
  const b = createBattle('m01', {}, 1);
  const typeId = o.typeId ?? 'grunt';
  b.state.enemies.push({
    id: 1,
    typeId,
    s: o.s ?? 0,
    hp: ENEMIES[typeId].hp,
    slowUntilTick: o.slowUntilTick ?? 0,
    slowFactor: o.slowFactor ?? 1,
  });
  return b;
}

describe('stepAdvance', () => {
  it('đẩy enemy đi speed * FIXED_DT', () => {
    const b = withEnemy();
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(ENEMIES.grunt.speed * FIXED_DT, 8);
  });

  it('áp hệ số chậm khi hiệu ứng còn hiệu lực', () => {
    const b = withEnemy({ slowUntilTick: 100, slowFactor: 0.5 });
    b.state.tick = 10;
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(ENEMIES.grunt.speed * 0.5 * FIXED_DT, 8);
  });

  it('bỏ qua hiệu ứng chậm đã hết hạn', () => {
    const b = withEnemy({ slowUntilTick: 5, slowFactor: 0.5 });
    b.state.tick = 10;
    stepAdvance(b);
    expect(b.state.enemies[0].s).toBeCloseTo(ENEMIES.grunt.speed * FIXED_DT, 8);
  });

  it('hết hạn ĐÚNG tại tick slowUntilTick, không sớm không muộn', () => {
    const b = withEnemy({ slowUntilTick: 10, slowFactor: 0.5 });
    b.state.tick = 9;
    stepAdvance(b);
    const movedSlow = b.state.enemies[0].s;
    b.state.enemies[0].s = 0;
    b.state.tick = 10;
    stepAdvance(b);
    expect(movedSlow).toBeLessThan(b.state.enemies[0].s);
  });

  it('xoá enemy tới cuối đường và trừ đúng số mạng', () => {
    const b = withEnemy({ s: 1e9 });
    stepAdvance(b);
    expect(b.state.enemies).toHaveLength(0);
    expect(b.state.lives).toBe(19);
    expect(b.state.stats.leaked).toBe(1);
  });

  it('enemy có giáp trừ hai mạng', () => {
    const b = withEnemy({ s: 1e9, typeId: 'armored' });
    stepAdvance(b);
    expect(b.state.lives).toBe(18);
  });

  it('thua khi hết mạng', () => {
    const b = withEnemy({ s: 1e9 });
    b.state.lives = 1;
    stepAdvance(b);
    expect(b.state.lives).toBe(0);
    expect(b.state.phase).toBe('lost');
  });

  it('mạng không bao giờ xuống dưới 0', () => {
    const b = withEnemy({ s: 1e9, typeId: 'armored' });
    b.state.lives = 1;
    stepAdvance(b);
    expect(b.state.lives).toBe(0);
  });

  it('nhiều enemy leak cùng tick: chỉ trừ tới 0 rồi dừng', () => {
    const b = createBattle('m01', {}, 1);
    b.state.lives = 2;
    for (let i = 0; i < 5; i++) {
      b.state.enemies.push({ id: i + 1, typeId: 'grunt', s: 1e9, hp: 60, slowUntilTick: 0, slowFactor: 1 });
    }
    stepAdvance(b);
    expect(b.state.lives).toBe(0);
    expect(b.state.phase).toBe('lost');
  });
});
