import { describe, it, expect } from 'vitest';
import { wavePercent, wavesDone } from '../../src/lib/waveProgress';

type Snap = Parameters<typeof wavesDone>[0];
const snap = (phase: Snap['phase'], waveNumber: number, waveCount = 12): Snap =>
  ({ phase, waveNumber, waveCount });

/**
 * Hồi quy cho một off-by-one mà code review bắt được.
 *
 * Bản đầu trừ 1 CHỈ ở pha `wave`, nên thanh tiến độ dao động ±1 ở mỗi lần đổi
 * pha: vào trận mới đã hiện 1/12, tụt về 0 khi đợt 1 chạy, nhảy lên 2 khi đợt 1
 * xong. `aria-valuenow` sai theo, nên người dùng screen reader nghe sai số đợt.
 */
describe('wavesDone', () => {
  it('vào trận mới: CHƯA có đợt nào xong', () => {
    expect(wavesDone(snap('prep', 1))).toBe(0);
  });

  it('đợt 1 đang chạy: vẫn chưa có đợt nào xong', () => {
    expect(wavesDone(snap('wave', 1))).toBe(0);
  });

  it('đợt 1 xong, chờ đợt 2: đúng một đợt xong', () => {
    expect(wavesDone(snap('prep', 2))).toBe(1);
  });

  it('đợt 2 đang chạy: vẫn đúng một đợt xong', () => {
    expect(wavesDone(snap('wave', 2))).toBe(1);
  });

  it('KHÔNG dao động khi đổi pha — đây là chính lỗi cũ', () => {
    for (let n = 1; n <= 12; n++) {
      expect(wavesDone(snap('prep', n))).toBe(wavesDone(snap('wave', n)));
    }
  });

  it('không bao giờ giảm khi trận tiến lên', () => {
    const series = [
      snap('prep', 1), snap('wave', 1), snap('prep', 2), snap('wave', 2),
      snap('prep', 3), snap('wave', 3),
    ];
    const values = series.map(wavesDone);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it('thắng: đủ số đợt của bản đồ', () => {
    expect(wavesDone(snap('won', 12))).toBe(12);
  });

  it('thua ở giữa: giữ số đợt đã xong, không nhảy lên đủ', () => {
    expect(wavesDone(snap('lost', 7))).toBe(6);
  });

  it('không âm', () => {
    expect(wavesDone(snap('prep', 0))).toBe(0);
  });
});

describe('wavePercent', () => {
  it('0% lúc vào trận, 100% khi thắng', () => {
    expect(wavePercent(snap('prep', 1))).toBe(0);
    expect(wavePercent(snap('won', 12))).toBe(100);
  });
  it('kẹp trong [0, 100]', () => {
    expect(wavePercent(snap('prep', 999))).toBe(100);
    expect(wavePercent(snap('prep', 1, 0))).toBe(0);
  });
});
