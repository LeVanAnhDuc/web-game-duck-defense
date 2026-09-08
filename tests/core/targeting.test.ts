import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { pickTarget } from '../../src/core/targeting';
import { pathAt } from '../../src/core/path';
import type { Enemy } from '../../src/core/types';
import { ENEMIES, type EnemyTypeId } from '../../src/data/enemies';

/** Tìm quãng đường s mà tại đó enemy gần một điểm nhất. */
function sNearest(b: ReturnType<typeof createBattle>, x: number, y: number): number {
  let bestS = 0;
  let bestD = Infinity;
  for (let s = 0; s <= b.path.length; s += 0.5) {
    const p = pathAt(b.path, s);
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestD) { bestD = d; bestS = s; }
  }
  return bestS;
}

function setup(towerId: 'arrow' | 'venom' = 'arrow', slotIndex = 7) {
  const b = createBattle('m01', towerId === 'venom' ? { arrowDamage: 3, unlockBolt: 1, unlockVenom: 1 } : {}, 1);
  b.state.gold = 9999;
  applyIntent(b, { kind: 'build', slotIndex, towerId });
  return { b, tower: b.state.towers[0], slot: b.map.slots[slotIndex] };
}

const push = (b: ReturnType<typeof createBattle>, id: number, s: number, typeId: EnemyTypeId = 'grunt', hp?: number): Enemy => {
  const e: Enemy = { id, typeId, s, hp: hp ?? ENEMIES[typeId].hp, slowUntilTick: 0, slowFactor: 1 };
  b.state.enemies.push(e);
  return e;
};

describe('pickTarget', () => {
  it('không có enemy thì trả null', () => {
    const { b, tower } = setup();
    expect(pickTarget(b, tower)).toBeNull();
  });

  it('bỏ qua enemy ngoài tầm', () => {
    const { b, tower } = setup();
    push(b, 1, b.path.length - 1); // cuối đường, xa slot 7
    expect(pickTarget(b, tower)).toBeNull();
  });

  it('chế độ first chọn enemy có s LỚN NHẤT trong tầm', () => {
    const { b, tower } = setup();
    const slot = b.map.slots[7];
    const sMid = sNearest(b, slot.x, slot.y);
    const near = push(b, 1, sMid - 8);
    const far = push(b, 2, sMid + 8);
    expect(pickTarget(b, tower)).toBe(far);
    expect(far.s).toBeGreaterThan(near.s);
  });

  it('chế độ strongest chọn enemy nhiều máu nhất, không phải đi xa nhất', () => {
    const { b, tower } = setup('venom');
    const slot = b.map.slots[7];
    const sMid = sNearest(b, slot.x, slot.y);
    push(b, 1, sMid + 6, 'grunt');
    const beefy = push(b, 2, sMid - 6, 'armored');
    expect(pickTarget(b, tower)).toBe(beefy);
  });

  it('enemy đúng tại rìa tầm vẫn được chọn, ngoài rìa thì không', () => {
    // Slot 9 (300,212), không phải slot 7: đường đi đã nằm trong tầm slot 7 ngay
    // từ s = 0, nên slot 7 không có biên "vừa vào tầm" để kiểm.
    const { b, tower, slot } = setup('arrow', 9);
    const range = Math.sqrt(b.rules.towers.arrow.levels[0].rangeSq);

    let sIn = -1;
    let sOut = -1;
    for (let s = 0; s <= b.path.length; s += 0.25) {
      const p = pathAt(b.path, s);
      const d = Math.hypot(p.x - slot.x, p.y - slot.y);
      if (sIn === -1 && d <= range) sIn = s;
      if (sIn !== -1 && sOut === -1 && d > range) sOut = s;
    }
    expect(sIn).toBeGreaterThan(0);

    b.state.enemies.length = 0;
    push(b, 1, sIn);
    expect(pickTarget(b, tower)).not.toBeNull();

    b.state.enemies.length = 0;
    push(b, 2, sIn - 1);
    expect(pickTarget(b, tower)).toBeNull();
  });
});
