import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { stepCleanup } from '../../src/core/step/cleanup';
import { ENEMIES } from '../../src/data/enemies';
import { MAPS } from '../../src/data/maps';

const b0 = () => createBattle('m01', {}, 1);

const dead = (b: ReturnType<typeof b0>, id: number, typeId: 'grunt' | 'armored' = 'grunt') => {
  b.state.enemies.push({ id, typeId, s: 100, hp: 0, slowUntilTick: 0, slowFactor: 1 });
};

describe('stepCleanup · xác và tiền', () => {
  it('trả tiền đúng một lần cho mỗi enemy chết, và tính vào goldEarned', () => {
    const b = b0();
    const before = b.state.gold;
    dead(b, 1);
    stepCleanup(b);
    expect(b.state.enemies).toHaveLength(0);
    expect(b.state.gold).toBe(before + ENEMIES.grunt.bounty);
    expect(b.state.stats.goldEarned).toBe(ENEMIES.grunt.bounty);
    expect(b.state.stats.killed).toBe(1);
    stepCleanup(b);
    expect(b.state.gold).toBe(before + ENEMIES.grunt.bounty);
  });

  it('nhánh Kinh tế làm tiền rơi nhiều hơn', () => {
    const plain = b0();
    dead(plain, 1);
    stepCleanup(plain);

    const rich = createBattle('m01', { bounty: 3 }, 1);
    dead(rich, 1);
    const before = rich.state.gold;
    stepCleanup(rich);
    expect(rich.state.gold - before).toBeGreaterThan(plain.state.stats.goldEarned);
  });

  it('không đụng tới enemy còn máu', () => {
    const b = b0();
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: 10, hp: 5, slowUntilTick: 0, slowFactor: 1 });
    stepCleanup(b);
    expect(b.state.enemies).toHaveLength(1);
  });
});

describe('stepCleanup · kết thúc đợt và kết thúc trận', () => {
  it('đợt chưa xong khi lịch sinh hết mà bản đồ còn enemy', () => {
    const b = b0();
    applyIntent(b, { kind: 'startWave' });
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    b.state.enemies.push({ id: 1, typeId: 'grunt', s: 10, hp: 5, slowUntilTick: 0, slowFactor: 1 });
    stepCleanup(b);
    expect(b.state.phase).toBe('wave');
  });

  it('đợt không phải cuối thì về prep và tăng waveIndex', () => {
    const b = b0();
    applyIntent(b, { kind: 'startWave' });
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    stepCleanup(b);
    expect(b.state.phase).toBe('prep');
    expect(b.state.waveIndex).toBe(1);
  });

  it('đợt cuối xong thì thắng', () => {
    const b = b0();
    b.state.waveIndex = MAPS.m01.waves.length - 1;
    applyIntent(b, { kind: 'startWave' });
    b.state.spawnCursor = MAPS.m01.waves[b.state.waveIndex].length;
    stepCleanup(b);
    expect(b.state.phase).toBe('won');
  });

  it('node waveInterest trả lãi khi hết đợt', () => {
    const b = createBattle('m01', { bounty: 2, waveInterest: 2 }, 1);
    applyIntent(b, { kind: 'startWave' });
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    b.state.gold = 1000;
    stepCleanup(b);
    expect(b.state.gold).toBe(1000 + 60); // 6% của 1000
  });

  it('không trả lãi khi chưa mua node', () => {
    const b = b0();
    applyIntent(b, { kind: 'startWave' });
    b.state.spawnCursor = MAPS.m01.waves[0].length;
    b.state.gold = 1000;
    stepCleanup(b);
    expect(b.state.gold).toBe(1000);
  });

  it('không làm gì khi đang ở prep', () => {
    const b = b0();
    const wave = b.state.waveIndex;
    stepCleanup(b);
    expect(b.state.waveIndex).toBe(wave);
    expect(b.state.phase).toBe('prep');
  });
});
