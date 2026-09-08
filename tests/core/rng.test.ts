import { describe, it, expect } from 'vitest';
import { makeRng, nextFloat, nextInt } from '../../src/core/rng';

describe('RNG có seed', () => {
  it('cùng seed cho cùng một chuỗi', () => {
    const a = makeRng(12345);
    const b = makeRng(12345);
    const seqA = [nextFloat(a), nextFloat(a), nextFloat(a)];
    const seqB = [nextFloat(b), nextFloat(b), nextFloat(b)];
    expect(seqA).toEqual(seqB);
  });

  it('hai seed khác cho hai chuỗi khác', () => {
    expect(nextFloat(makeRng(1))).not.toBe(nextFloat(makeRng(2)));
  });

  it('luôn nằm trong [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 5000; i++) {
      const v = nextFloat(r);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt luôn nằm trong [0, maxExclusive) và là số nguyên', () => {
    const r = makeRng(99);
    for (let i = 0; i < 2000; i++) {
      const v = nextInt(r, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
  });

  it('phủ hết mọi giá trị của nextInt(r, 6) trong 2000 lần rút', () => {
    const r = makeRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) seen.add(nextInt(r, 6));
    expect(seen.size).toBe(6);
  });
});
