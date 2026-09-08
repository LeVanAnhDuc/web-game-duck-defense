import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SNAPSHOT_INTERVAL_MS, drainIntents, getSnapshot, publishSnapshot,
  pushIntent, resetBridge, subscribeSnapshot,
} from '../../src/bridge';
import type { BattleSnapshot } from '../../src/bridge';

const fakeSnapshot = (tick: number) => ({ tick } as BattleSnapshot);

beforeEach(() => resetBridge());

describe('hàng đợi ý định', () => {
  it('rút theo đúng thứ tự đã đẩy, và rỗng sau khi rút', () => {
    pushIntent({ kind: 'startWave' });
    pushIntent({ kind: 'build', slotIndex: 1, towerId: 'arrow' });
    const out = drainIntents();
    expect(out.map((i) => i.kind)).toEqual(['startWave', 'build']);
    expect(drainIntents()).toEqual([]);
  });

  it('rút hàng đợi rỗng không tạo mảng mới mỗi lần', () => {
    expect(drainIntents()).toHaveLength(0);
  });
});

describe('kho snapshot', () => {
  it('đẩy ở 10Hz, không phải mỗi frame (invariants #7)', () => {
    expect(SNAPSHOT_INTERVAL_MS).toBe(100);
  });

  it('thông báo cho người đăng ký và dừng sau khi bỏ đăng ký', () => {
    const fn = vi.fn();
    const off = subscribeSnapshot(fn);
    publishSnapshot(fakeSnapshot(1));
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    publishSnapshot(fakeSnapshot(2));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('giữ snapshot mới nhất cho người vào sau', () => {
    publishSnapshot(fakeSnapshot(7));
    expect(getSnapshot()?.tick).toBe(7);
  });

  it('nhiều người đăng ký đều nhận được', () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribeSnapshot(a);
    subscribeSnapshot(b);
    publishSnapshot(fakeSnapshot(3));
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('reset xoá hàng đợi, snapshot và người đăng ký', () => {
    const fn = vi.fn();
    subscribeSnapshot(fn);
    pushIntent({ kind: 'startWave' });
    publishSnapshot(fakeSnapshot(1));

    resetBridge();

    expect(getSnapshot()).toBeNull();
    expect(drainIntents()).toEqual([]);
    publishSnapshot(fakeSnapshot(2));
    expect(fn).toHaveBeenCalledTimes(1); // chỉ lần trước reset
  });
});
