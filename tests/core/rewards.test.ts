import { describe, it, expect } from 'vitest';
import { CORES_PER_WAVE, FIRST_CLEAR_BONUS, coresAward } from '../../src/core/rewards';

describe('coresAward (FR-16)', () => {
  it('trả theo số đợt sống sót', () => {
    expect(coresAward(9, false, false)).toBe(9 * CORES_PER_WAVE);
  });

  it('thua vẫn có lõi — thua không phải về không', () => {
    expect(coresAward(1, false, false)).toBeGreaterThan(0);
  });

  it('thắng lần đầu có thưởng lớn', () => {
    expect(coresAward(12, true, false)).toBe(12 * CORES_PER_WAVE + FIRST_CLEAR_BONUS);
  });

  it('chơi lại bản đồ đã thắng ít hơn HẲN lần đầu', () => {
    const first = coresAward(12, true, false);
    const replay = coresAward(12, true, true);
    expect(replay).toBeLessThan(first / 2);
  });

  it('cày bản đồ dễ không bao giờ hiệu quả hơn thắng lần đầu một bản đồ khó', () => {
    // 12 đợt bản đồ 1 chơi lại vs 18 đợt bản đồ 5 lần đầu
    expect(coresAward(12, true, true)).toBeLessThan(coresAward(18, true, false));
    // và kể cả THUA giữa bản đồ 5 lần đầu vẫn hơn cày trọn bản đồ 1
    expect(coresAward(12, true, true)).toBeLessThan(coresAward(9, false, false));
  });

  it('luôn trả số nguyên không âm', () => {
    for (const waves of [0, 1, 7, 18]) {
      for (const won of [true, false]) {
        for (const cleared of [true, false]) {
          const v = coresAward(waves, won, cleared);
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
