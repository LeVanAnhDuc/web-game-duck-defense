import { describe, it, expect } from 'vitest';
import { runBattle } from '../../src/core/runBattle';
import { applyIntent, createBattle } from '../../src/core/battle';
import { step } from '../../src/core/step';
import { MAPS, MAP_ORDER } from '../../src/data/maps';

/** Là hàm chứ không phải so sánh tại chỗ: `phase` bị `step()` thay đổi và
 *  TypeScript không thấy điều đó, nên so sánh tại chỗ bị narrow sai. */
const over = (b: ReturnType<typeof createBattle>): boolean =>
  b.state.phase === 'won' || b.state.phase === 'lost';

describe('runBattle · xác định tính', () => {
  it('cùng seed cho cùng kết quả', () => {
    const a = runBattle('m01', MAPS.m01.referenceLayout, {}, 42);
    const b = runBattle('m01', MAPS.m01.referenceLayout, {}, 42);
    expect(a).toEqual(b);
  });

  it('cùng seed cho cùng kết quả trên mọi bản đồ', () => {
    for (const id of MAP_ORDER) {
      const a = runBattle(id, MAPS[id].referenceLayout, {}, 7);
      const b = runBattle(id, MAPS[id].referenceLayout, {}, 7);
      expect(a).toEqual(b);
    }
  });

  it('kết thúc thay vì treo khi bố cục không thắng được', () => {
    const o = runBattle('m01', [], {}, 1);
    expect(o.won).toBe(false);
    expect(o.ticks).toBeLessThan(200_000);
  });

  it('chạy trọn một trận trong dưới 200ms (NFR-PERF-10)', () => {
    const t0 = performance.now();
    runBattle('m01', MAPS.m01.referenceLayout, {}, 1);
    expect(performance.now() - t0).toBeLessThan(200);
  });

  it('chạy trọn bản đồ dài nhất trong dưới 200ms', () => {
    const t0 = performance.now();
    runBattle('m05', MAPS.m05.referenceLayout, {}, 1);
    expect(performance.now() - t0).toBeLessThan(200);
  });
});

/**
 * NFR-PERF-06 — kết quả trận KHÔNG phụ thuộc phần cứng.
 *
 * Trên máy nhanh, `game/` chạy 1 tick mỗi frame; trên máy tụt frame nó chạy 3-5
 * tick liền nhau trong một frame. Test này mô phỏng đúng cái đó: chia cùng một
 * trận thành các lô tick có kích thước khác nhau và khẳng định state cuối giống hệt.
 *
 * Nó chứng minh mô phỏng KHÔNG GIỮ state theo frame: không accumulator nào nằm
 * trong `core/`, không ai nhân `dt`. Nếu một ngày có, kích thước lô sẽ đổi kết
 * quả và test này đỏ.
 */
describe('độc lập phần cứng (NFR-PERF-06)', () => {
  function playInBatches(batch: number) {
    const b = createBattle('m01', {}, 5);
    const plan = MAPS.m01.referenceLayout;
    b.state.gold = Number.MAX_SAFE_INTEGER;
    for (const p of plan) {
      applyIntent(b, { kind: 'build', slotIndex: p.slotIndex, towerId: p.towerId });
      const t = b.state.towers[b.state.towers.length - 1];
      for (let l = 1; l < p.level; l++) applyIntent(b, { kind: 'upgrade', towerId: t.id });
    }
    b.state.gold = MAPS.m01.startGold;
    b.state.stats.goldEarned = 0;

    let ticks = 0;
    while (!over(b) && ticks < 200_000) {
      for (let i = 0; i < batch && !over(b); i++) {
        // Ý định được áp ở RANH GIỚI TICK, không ở ranh giới frame — invariants #5.
        // Đặt ở đây thì kích thước lô không còn quyết định đợt được gọi lúc nào,
        // nên test đo đúng thứ nó muốn đo: bản thân mô phỏng.
        if (b.state.phase === 'prep') applyIntent(b, { kind: 'startWave' });
        step(b);
        ticks++;
      }
    }
    return { tick: b.state.tick, phase: b.state.phase, lives: b.state.lives, stats: b.state.stats };
  }

  it('lô 1, 3 và 7 tick cho cùng state cuối', () => {
    const one = playInBatches(1);
    expect(playInBatches(3)).toEqual(one);
    expect(playInBatches(7)).toEqual(one);
  });
});
