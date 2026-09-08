import { describe, it, expect } from 'vitest';
import { applyUpgrades, fullUpgradeState, totalPowerFactor } from '../../src/core/upgrades';
import { TOWERS } from '../../src/data/towers';
import { TOTAL_TREE_COST, UPGRADE_NODE_IDS, UPGRADE_TREE } from '../../src/data/upgradeTree';

describe('hình dạng cây nâng cấp', () => {
  it('mỗi node có đúng maxLevel giá', () => {
    for (const id of UPGRADE_NODE_IDS) {
      expect(UPGRADE_TREE[id].costs).toHaveLength(UPGRADE_TREE[id].maxLevel);
    }
  });

  it('giá tăng dần theo bậc', () => {
    for (const id of UPGRADE_NODE_IDS) {
      const c = UPGRADE_TREE[id].costs;
      for (let i = 1; i < c.length; i++) expect(c[i]).toBeGreaterThan(c[i - 1]);
    }
  });

  it('điều kiện tiên quyết chỉ trỏ tới node có thật, và không tự trỏ vào mình', () => {
    for (const id of UPGRADE_NODE_IDS) {
      for (const p of UPGRADE_TREE[id].prereq) {
        expect(UPGRADE_NODE_IDS).toContain(p.id);
        expect(p.id).not.toBe(id);
        expect(p.level).toBeGreaterThanOrEqual(1);
        expect(p.level).toBeLessThanOrEqual(UPGRADE_TREE[p.id].maxLevel);
      }
    }
  });

  it('không có chu trình trong quan hệ tiên quyết', () => {
    const seen = new Set<string>();
    const visit = (id: string, stack: string[]): void => {
      if (stack.includes(id)) throw new Error(`chu trình: ${[...stack, id].join(' -> ')}`);
      if (seen.has(id)) return;
      seen.add(id);
      for (const p of UPGRADE_TREE[id as keyof typeof UPGRADE_TREE].prereq) visit(p.id, [...stack, id]);
    };
    expect(() => UPGRADE_NODE_IDS.forEach((id) => visit(id, []))).not.toThrow();
  });

  it('tổng giá cả cây là số dương và khớp tổng các node', () => {
    const sum = UPGRADE_NODE_IDS.reduce(
      (s, id) => s + UPGRADE_TREE[id].costs.reduce((a, b) => a + b, 0), 0,
    );
    expect(TOTAL_TREE_COST).toBe(sum);
    expect(TOTAL_TREE_COST).toBeGreaterThan(0);
  });
});

describe('applyUpgrades', () => {
  it('cây trống trả về bảng tháp không đổi, và các hệ số trung tính', () => {
    const r = applyUpgrades({});
    expect(r.startGold).toBe(0);
    expect(r.startLives).toBe(0);
    expect(r.bountyMultiplier).toBe(1);
    expect(r.buildCostMultiplier).toBe(1);
    expect(r.sellRatio).toBe(0.5);
    expect(r.waveInterestPct).toBe(0);
    expect(r.towers.arrow.levels[0].damage).toBe(TOWERS.arrow.levels[0].damage);
  });

  it('KHÔNG BAO GIỜ sửa bảng tháp gốc (invariants #6)', () => {
    const before = JSON.stringify(TOWERS);
    applyUpgrades(fullUpgradeState());
    applyUpgrades({ arrowDamage: 4, cannonSplash: 3, frostDepth: 3 });
    expect(JSON.stringify(TOWERS)).toBe(before);
  });

  it('hai lần gọi liên tiếp cho cùng kết quả — không có state rò rỉ giữa các trận', () => {
    const a = JSON.stringify(applyUpgrades({ arrowDamage: 2 }));
    applyUpgrades(fullUpgradeState());
    const b = JSON.stringify(applyUpgrades({ arrowDamage: 2 }));
    expect(b).toBe(a);
  });

  it('cộng vàng và mạng khởi đầu theo bậc', () => {
    expect(applyUpgrades({ startGold: 4 }).startGold).toBe(200);
    expect(applyUpgrades({ startLives: 3 }).startLives).toBe(6);
  });

  it('tăng sát thương đúng dòng tháp, không lan sang dòng khác', () => {
    const r = applyUpgrades({ arrowDamage: 4 });
    expect(r.towers.arrow.levels[0].damage).toBeGreaterThan(TOWERS.arrow.levels[0].damage);
    expect(r.towers.cannon.levels[0].damage).toBe(TOWERS.cannon.levels[0].damage);
  });

  it('làm chậm sâu hơn nhưng có sàn 0.15', () => {
    const r = applyUpgrades({ arrowDamage: 2, frostDepth: 3 });
    const lv = r.towers.frost.levels[2];
    expect(lv.slowFactor).toBeLessThan(TOWERS.frost.levels[2].slowFactor);
    expect(lv.slowFactor).toBeGreaterThanOrEqual(0.15);
  });

  it('chỉ tăng bán kính nổ của tháp có nổ lan', () => {
    const r = applyUpgrades({ cannonSplash: 3 });
    expect(r.towers.cannon.levels[0].splashRadius).toBeGreaterThan(TOWERS.cannon.levels[0].splashRadius);
    expect(r.towers.arrow.levels[0].splashRadius).toBe(0);
  });

  it('mở khoá tháp mới', () => {
    expect(applyUpgrades({}).unlockedTowers).toEqual(['arrow', 'cannon', 'frost']);
    const r = applyUpgrades({ arrowDamage: 3, unlockBolt: 1, unlockVenom: 1 });
    expect(r.unlockedTowers).toContain('bolt');
    expect(r.unlockedTowers).toContain('venom');
  });

  it('kẹp bậc vượt maxLevel và bỏ qua giá trị rác', () => {
    expect(applyUpgrades({ startGold: 99 }).startGold).toBe(200);
    expect(applyUpgrades({ startGold: -5 }).startGold).toBe(0);
    expect(applyUpgrades({ startGold: NaN as unknown as number }).startGold).toBe(0);
    expect(applyUpgrades({ startGold: 2.7 }).startGold).toBe(100);
  });
});

describe('trần sức mạnh (design.md §4)', () => {
  it('cả cây mua hết không vượt +60% tổng lực', () => {
    const factor = totalPowerFactor(fullUpgradeState());
    expect(factor).toBeGreaterThan(1);
    expect(factor).toBeLessThanOrEqual(1.6);
  });

  it('cây trống có hệ số đúng bằng 1', () => {
    expect(totalPowerFactor({})).toBeCloseTo(1, 10);
  });
});
