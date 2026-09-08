import { describe, it, expect } from 'vitest';
import { applyIntent, createBattle } from '../../src/core/battle';
import { MAPS } from '../../src/data/maps';

const fresh = () => createBattle('m01', {}, 1);
const M01 = MAPS.m01;

describe('createBattle', () => {
  it('bắt đầu ở prep, đợt 0, với kinh tế của bản đồ', () => {
    const b = fresh();
    expect(b.state.phase).toBe('prep');
    expect(b.state.waveIndex).toBe(0);
    expect(b.state.gold).toBe(M01.startGold);
    expect(b.state.lives).toBe(M01.startLives);
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.enemies).toHaveLength(0);
    expect(b.state.projectiles).toHaveLength(0);
  });

  it('giải đường đi thành chiều dài dương', () => {
    expect(fresh().path.length).toBeGreaterThan(0);
  });

  it('cộng hiệu ứng nâng cấp vào vàng và mạng khởi đầu', () => {
    const b = createBattle('m01', { startGold: 2, startLives: 1 }, 1);
    expect(b.state.gold).toBe(M01.startGold + 100);
    expect(b.state.lives).toBe(M01.startLives + 2);
  });
});

describe('applyIntent · build', () => {
  it('đặt tháp và trừ tiền', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(1);
    expect(b.state.towers[0].slotIndex).toBe(7);
    expect(b.state.towers[0].level).toBe(1);
    expect(b.state.gold).toBe(M01.startGold - 60);
  });

  it('bỏ qua khi ô đã có tháp', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const goldAfterFirst = b.state.gold;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'cannon' });
    expect(b.state.towers).toHaveLength(1);
    expect(b.state.gold).toBe(goldAfterFirst);
  });

  it('bỏ qua khi không đủ tiền', () => {
    const b = fresh();
    b.state.gold = 10;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.gold).toBe(10);
  });

  it('bỏ qua chỉ số ô mà bản đồ không có', () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 999, towerId: 'arrow' });
    applyIntent(b, { kind: 'build', slotIndex: -1, towerId: 'arrow' });
    expect(b.state.towers).toHaveLength(0);
  });

  it('bỏ qua tháp chưa mở khoá, dù có đủ tiền', () => {
    const b = fresh();
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'venom' });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.gold).toBe(9999);
  });

  it('cho xây tháp đã mở qua cây nâng cấp', () => {
    const b = createBattle('m01', { arrowDamage: 3, unlockBolt: 1 }, 1);
    b.state.gold = 9999;
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'bolt' });
    expect(b.state.towers).toHaveLength(1);
  });
});

describe('applyIntent · upgrade và sell', () => {
  const built = () => {
    const b = fresh();
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    return { b, id: b.state.towers[0].id };
  };

  it('tăng bậc và trừ đúng giá của bậc đó', () => {
    const { b, id } = built();
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(b.state.towers[0].level).toBe(2);
    expect(b.state.gold).toBe(M01.startGold - 60 - 60);
  });

  it('bấm nâng cấp hai lần liên tiếp trừ giá bậc 1 rồi giá bậc 2, không trừ hai lần cùng giá', () => {
    const { b, id } = built();
    const before = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    const afterFirst = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(afterFirst).toBe(before - 60);
    expect(b.state.gold).toBe(afterFirst - 110);
    expect(b.state.towers[0].level).toBe(3);
  });

  it('từ chối nâng quá bậc cuối', () => {
    const { b, id } = built();
    b.state.gold = 9999;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    applyIntent(b, { kind: 'upgrade', towerId: id });
    const goldAtMax = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: id });
    expect(b.state.towers[0].level).toBe(3);
    expect(b.state.gold).toBe(goldAtMax);
  });

  it('bán thu về nửa số đã tiêu, làm tròn xuống', () => {
    const { b, id } = built();
    applyIntent(b, { kind: 'upgrade', towerId: id }); // đã tiêu 60 + 60 = 120
    const before = b.state.gold;
    applyIntent(b, { kind: 'sell', towerId: id });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.gold).toBe(before + 60);
  });

  it('bán rồi xây lại không bao giờ kiếm được tiền', () => {
    const { b, id } = built();
    const goldAfterBuild = b.state.gold;
    applyIntent(b, { kind: 'sell', towerId: id });
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    expect(b.state.gold).toBeLessThan(goldAfterBuild);
  });

  it('node sellRatio làm bán thu về 75%', () => {
    const b = createBattle('m01', { buildCost: 1, sellRatio: 1 }, 1);
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    const cost = Math.round(60 * 0.95);
    const before = b.state.gold;
    applyIntent(b, { kind: 'sell', towerId: b.state.towers[0].id });
    expect(b.state.gold).toBe(before + Math.floor(cost * 0.75));
  });

  it('bỏ qua id không tồn tại', () => {
    const b = fresh();
    const gold = b.state.gold;
    applyIntent(b, { kind: 'upgrade', towerId: 424242 });
    applyIntent(b, { kind: 'sell', towerId: 424242 });
    expect(b.state.gold).toBe(gold);
  });
});

describe('applyIntent · startWave', () => {
  it('chuyển prep sang wave', () => {
    const b = fresh();
    applyIntent(b, { kind: 'startWave' });
    expect(b.state.phase).toBe('wave');
    expect(b.state.spawnCursor).toBe(0);
    expect(b.state.spawnedFromCursor).toBe(0);
  });

  it('bị bỏ qua khi một đợt đang chạy', () => {
    const b = fresh();
    applyIntent(b, { kind: 'startWave' });
    const wave = b.state.waveIndex;
    applyIntent(b, { kind: 'startWave' });
    expect(b.state.waveIndex).toBe(wave);
  });
});

describe('applyIntent · sau khi trận kết thúc', () => {
  it('mọi ý định đều bị bỏ qua', () => {
    const b = fresh();
    b.state.phase = 'lost';
    applyIntent(b, { kind: 'build', slotIndex: 7, towerId: 'arrow' });
    applyIntent(b, { kind: 'startWave' });
    expect(b.state.towers).toHaveLength(0);
    expect(b.state.phase).toBe('lost');
  });
});
