import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { stepSpawn } from '../../src/core/step/spawn';
import { MAPS } from '../../src/data/maps';

const started = () => {
  const b = createBattle('m01', {}, 1);
  applyIntent(b, { kind: 'startWave' });
  return b;
};

describe('stepSpawn', () => {
  it('không sinh gì trong pha prep', () => {
    const b = createBattle('m01', {}, 1);
    for (let i = 0; i < 200; i++) stepSpawn(b);
    expect(b.state.enemies).toHaveLength(0);
  });

  it('sinh con đầu tiên tại s = 0 ngay khi hết delayTicks', () => {
    const b = started();
    const delay = MAPS.m01.waves[0][0].delayTicks;
    // `delay` tick đầu chỉ đếm ngược, chưa sinh gì
    for (let i = 0; i < delay; i++) {
      stepSpawn(b);
      expect(b.state.enemies).toHaveLength(0);
    }
    stepSpawn(b);
    expect(b.state.enemies).toHaveLength(1);
    expect(b.state.enemies[0].s).toBe(0);
  });

  it('sinh cách nhau đúng intervalTicks', () => {
    const b = started();
    const entry = MAPS.m01.waves[0][0];
    stepSpawn(b);
    expect(b.state.enemies).toHaveLength(1);
    for (let i = 0; i < entry.intervalTicks; i++) stepSpawn(b);
    expect(b.state.enemies).toHaveLength(2);
  });

  it('chỉ chuyển spawnCursor sau khi sinh đủ count', () => {
    const b = started();
    const entry = MAPS.m01.waves[0][0];
    for (let i = 0; i < entry.count * (entry.intervalTicks + 1); i++) stepSpawn(b);
    expect(b.state.enemies.length).toBe(entry.count);
    expect(b.state.spawnCursor).toBe(1);
  });

  it('ngừng sinh khi lịch đã hết', () => {
    const b = started();
    for (let i = 0; i < 5000; i++) stepSpawn(b);
    const total = MAPS.m01.waves[0].reduce((n, e) => n + e.count, 0);
    expect(b.state.enemies).toHaveLength(total);
  });

  it('mỗi enemy có id riêng', () => {
    const b = started();
    for (let i = 0; i < 5000; i++) stepSpawn(b);
    const ids = b.state.enemies.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
