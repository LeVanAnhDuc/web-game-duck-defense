import { describe, it, expect } from 'vitest';
import { buildPath, pathAt } from '../../src/core/path';

const LINE = buildPath([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
const CORNER = buildPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }]);

describe('buildPath', () => {
  it('cộng chiều dài từng đoạn', () => {
    expect(LINE.length).toBe(100);
    expect(CORNER.length).toBe(150);
  });

  it('cumulative bắt đầu từ 0 và kết thúc bằng length', () => {
    expect(CORNER.cumulative[0]).toBe(0);
    expect(CORNER.cumulative[CORNER.cumulative.length - 1]).toBe(150);
  });

  it('từ chối polyline chỉ có một điểm', () => {
    expect(() => buildPath([{ x: 0, y: 0 }])).toThrow();
  });
});

describe('pathAt', () => {
  it('s = 0 trả về waypoint đầu', () => {
    expect(pathAt(LINE, 0)).toEqual({ x: 0, y: 0 });
  });

  it('s = length trả về waypoint cuối', () => {
    expect(pathAt(CORNER, 150)).toEqual({ x: 100, y: 50 });
  });

  it('nội suy trong một đoạn', () => {
    expect(pathAt(LINE, 25)).toEqual({ x: 25, y: 0 });
  });

  it('đúng tại điểm rẽ, không trôi', () => {
    expect(pathAt(CORNER, 100)).toEqual({ x: 100, y: 0 });
  });

  it('nội suy trong đoạn thứ hai', () => {
    expect(pathAt(CORNER, 120)).toEqual({ x: 100, y: 20 });
  });

  it('kẹp s vượt cuối thay vì ngoại suy', () => {
    expect(pathAt(CORNER, 999)).toEqual({ x: 100, y: 50 });
  });

  it('kẹp s âm', () => {
    expect(pathAt(CORNER, -5)).toEqual({ x: 0, y: 0 });
  });

  it('đi hết đường không nhảy: mỗi bước nhỏ dịch chuyển nhỏ', () => {
    let prev = pathAt(CORNER, 0);
    for (let s = 1; s <= CORNER.length; s += 1) {
      const cur = pathAt(CORNER, s);
      expect(Math.hypot(cur.x - prev.x, cur.y - prev.y)).toBeLessThanOrEqual(1.0001);
      prev = cur;
    }
  });
});
