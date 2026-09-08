import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { step } from '../../src/core/step';
import { pathAt } from '../../src/core/path';
import { FIXED_DT } from '../../src/core/types';
import { ENEMIES } from '../../src/data/enemies';
import { MAPS } from '../../src/data/maps';

/**
 * Test bảo vệ `invariants.md` #1 — thứ tự năm bước trong một tick.
 *
 * Đây là bất biến duy nhất trong dự án mà vi phạm nó KHÔNG làm test nào khác
 * đỏ: game vẫn chạy, mọi phát bắn chỉ lệch một chút, và không ai giải thích
 * được. File này biến nó từ một dòng văn thành một thứ có thể đỏ.
 *
 * Đã kiểm bằng cách đảo `stepAdvance` và `stepFire` trong `src/core/step/index.ts`
 * và xác nhận test đầu tiên dưới đây FAIL. Một guard không thể đỏ thì không phải
 * là guard.
 */

/** Tìm chính xác quãng đường s mà enemy vừa vào tầm bắn của một ô. */
function boundaryS(b: ReturnType<typeof createBattle>, slotIndex: number, rangeSq: number): number {
  const slot = b.map.slots[slotIndex];
  const d2 = (s: number) => {
    const p = pathAt(b.path, s);
    return (p.x - slot.x) ** 2 + (p.y - slot.y) ** 2;
  };

  // quét thô để tìm khoảng chuyển từ ngoài tầm sang trong tầm
  let lo = -1;
  let hi = -1;
  for (let s = 0; s <= b.path.length; s += 1) {
    if (d2(s) <= rangeSq) { hi = s; lo = s - 1; break; }
  }
  if (hi <= 0) throw new Error('ô này trong tầm ngay từ s = 0, không có biên để kiểm');

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (d2(mid) <= rangeSq) hi = mid; else lo = mid;
  }
  return hi;
}

describe('thứ tự một tick (invariants #1)', () => {
  it('bắn vào vị trí enemy SAU khi nó tiến trong tick này, không phải trước', () => {
    const b = createBattle('m01', {}, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 9, towerId: 'arrow' });
    const tower = b.state.towers[0];
    tower.cooldown = 0;

    const rangeSq = b.rules.towers.arrow.levels[0].rangeSq;
    const sIn = boundaryS(b, 9, rangeSq);

    // Đặt enemy NGAY BÊN NGOÀI rìa tầm, gần đủ để một tick tiến là vào trong.
    const perTick = ENEMIES.grunt.speed * FIXED_DT;
    const sJustOutside = sIn - perTick * 0.7;

    b.state.phase = 'wave';
    b.state.spawnCursor = MAPS.m01.waves[0].length; // không sinh thêm gì
    b.state.enemies.push({
      id: 999, typeId: 'grunt', s: sJustOutside,
      hp: ENEMIES.grunt.hp, slowUntilTick: 0, slowFactor: 1,
    });

    // Chưa tick: enemy ngoài tầm.
    expect(b.state.projectiles).toHaveLength(0);

    step(b);

    // Thứ tự đúng (tiến rồi mới bắn) => có đúng một phát.
    // Thứ tự sai (bắn rồi mới tiến)  => không có phát nào.
    expect(b.state.projectiles).toHaveLength(1);
  });

  it('tăng tick đúng một lần mỗi lần step', () => {
    const b = createBattle('m01', {}, 1);
    const t = b.state.tick;
    step(b);
    step(b);
    step(b);
    expect(b.state.tick).toBe(t + 3);
  });

  it('dừng tick ngay khi hết mạng, không chạy tiếp bước 3-5', () => {
    const b = createBattle('m01', {}, 1);
    b.state.phase = 'wave';
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    b.state.lives = 1;
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: 1e9, hp: 60, slowUntilTick: 0, slowFactor: 1 });
    const tickBefore = b.state.tick;

    step(b);

    expect(b.state.phase).toBe('lost');
    // tick KHÔNG tăng: nó tăng ở cuối, sau bước 5, và ta đã return trước đó
    expect(b.state.tick).toBe(tickBefore);
  });

  it('không làm gì thêm khi trận đã kết thúc', () => {
    const b = createBattle('m01', {}, 1);
    b.state.phase = 'won';
    const snapshot = JSON.stringify(b.state);
    step(b);
    step(b);
    expect(JSON.stringify(b.state)).toBe(snapshot);
  });

  it('enemy chết được trả tiền trong cùng tick nó chết (bước 4 rồi bước 5)', () => {
    const b = createBattle('m01', {}, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    b.state.towers[0].cooldown = 0;
    b.state.phase = 'wave';
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    // enemy 1 máu, ngay trong tầm và ngay cạnh nòng: bắn, trúng, chết, trả tiền
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: 38, hp: 1, slowUntilTick: 0, slowFactor: 1 });

    const goldBefore = b.state.gold;
    // Đạn phải bay 56 đơn vị từ nòng tới mục tiêu; ở 420 đơn vị/giây đó là ~8 tick.
    for (let i = 0; i < 20; i++) step(b);

    expect(b.state.enemies).toHaveLength(0);
    expect(b.state.gold).toBeGreaterThan(goldBefore);
    expect(b.state.stats.killed).toBe(1);
  });
});
