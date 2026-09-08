import { describe, it, expect } from 'vitest';
import { FIXED_DT, TICKS_PER_SECOND } from '../../src/core/types';

describe('hằng số mô phỏng', () => {
  it('chạy đúng 60Hz', () => {
    expect(TICKS_PER_SECOND).toBe(60);
    expect(FIXED_DT).toBeCloseTo(1 / 60, 10);
  });
});
