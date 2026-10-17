import { describe, it, expect } from 'vitest';
import { bountyFor, buildCost, sellValue, upgradeCostOf, waveInterest } from '../../src/core/economy';
import { applyUpgrades } from '../../src/core/upgrades';
import { TOWERS } from '../../src/data/towers';

const base = applyUpgrades({});

describe('buildCost', () => {
  it('bằng giá gốc khi chưa mua nâng cấp', () => {
    expect(buildCost(base, 'arrow')).toBe(TOWERS.arrow.cost);
  });

  it('nhân dồn theo bậc, không cộng dồn: ba bậc 5% ra 0.857 chứ không 0.85', () => {
    const r = applyUpgrades({ buildCost: 3 });
    expect(buildCost(r, 'arrow')).toBe(Math.round(TOWERS.arrow.cost * 0.95 ** 3));
  });

  it('luôn trả về số nguyên', () => {
    const r = applyUpgrades({ buildCost: 2 });
    for (const id of ['arrow', 'cannon', 'frost'] as const) {
      expect(Number.isInteger(buildCost(r, id))).toBe(true);
    }
  });
});

describe('upgradeCostOf', () => {
  it('trả giá của bậc hiện tại', () => {
    expect(upgradeCostOf(base, 'arrow', 1)).toBe(TOWERS.arrow.levels[0].upgradeCost);
    expect(upgradeCostOf(base, 'arrow', 2)).toBe(TOWERS.arrow.levels[1].upgradeCost);
  });

  it('trả null ở bậc cuối', () => {
    expect(upgradeCostOf(base, 'arrow', TOWERS.arrow.levels.length)).toBeNull();
  });

  it('trả null cho bậc ngoài khoảng', () => {
    expect(upgradeCostOf(base, 'arrow', 0)).toBeNull();
    expect(upgradeCostOf(base, 'arrow', 99)).toBeNull();
  });
});

describe('sellValue', () => {
  it('bằng nửa giá xây ở bậc 1, làm tròn xuống', () => {
    expect(sellValue(base, 'arrow', 1)).toBe(Math.floor(TOWERS.arrow.cost * 0.5));
  });

  it('tính cả tiền đã tiêu để nâng cấp', () => {
    const spent = TOWERS.arrow.cost + (TOWERS.arrow.levels[0].upgradeCost ?? 0);
    expect(sellValue(base, 'arrow', 2)).toBe(Math.floor(spent * 0.5));
  });

  it('không bao giờ lớn hơn số đã tiêu — bán rồi xây lại không kiếm được tiền', () => {
    for (const id of ['arrow', 'cannon', 'frost'] as const) {
      for (let lvl = 1; lvl <= TOWERS[id].levels.length; lvl++) {
        let spent = buildCost(base, id);
        for (let l = 1; l < lvl; l++) spent += TOWERS[id].levels[l - 1].upgradeCost ?? 0;
        expect(sellValue(base, id, lvl)).toBeLessThan(spent);
      }
    }
  });

  it('node sellRatio nâng lên 75% nhưng vẫn dưới số đã tiêu', () => {
    const r = applyUpgrades({ buildCost: 1, sellRatio: 1 });
    const spent = buildCost(r, 'arrow');
    expect(sellValue(r, 'arrow', 1)).toBe(Math.floor(spent * 0.75));
    expect(sellValue(r, 'arrow', 1)).toBeLessThan(spent);
  });
});

describe('bountyFor', () => {
  it('không đổi khi chưa mua nhánh Kinh tế', () => {
    expect(bountyFor(base, 11)).toBe(11);
  });
  it('tăng theo bậc và trả số nguyên', () => {
    const r = applyUpgrades({ bounty: 3 });
    expect(bountyFor(r, 11)).toBe(Math.round(11 * 1.15));
    expect(Number.isInteger(bountyFor(r, 11))).toBe(true);
  });
});

describe('waveInterest', () => {
  it('bằng 0 khi chưa mua node', () => {
    expect(waveInterest(base, 1000)).toBe(0);
  });
  it('trả phần trăm số vàng đang giữ, làm tròn xuống', () => {
    const r = applyUpgrades({ bounty: 2, waveInterest: 2 });
    expect(waveInterest(r, 1000)).toBe(60);
    expect(waveInterest(r, 99)).toBe(5);
  });
});
