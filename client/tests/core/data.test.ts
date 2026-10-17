import { describe, it, expect } from 'vitest';
import { TOWERS, TOWER_IDS, STARTER_TOWER_IDS } from '../../src/data/towers';
import { ENEMIES } from '../../src/data/enemies';
import { MAPS, MAP_ORDER } from '../../src/data/maps';
import { buildPath, pathAt } from '../../src/core/path';

// Các test này khẳng định HÌNH DẠNG và tính nhất quán nội bộ, không khẳng định
// con số có vui hay không. Việc đó là của tests/balance/ và của người chơi.

describe('số liệu tháp', () => {
  it('mỗi tháp có ít nhất ba bậc', () => {
    for (const t of Object.values(TOWERS)) expect(t.levels.length).toBeGreaterThanOrEqual(3);
  });

  it('upgradeCost là null ở bậc cuối và CHỈ ở bậc cuối', () => {
    for (const t of Object.values(TOWERS)) {
      t.levels.forEach((lv, i) => {
        expect(lv.upgradeCost === null).toBe(i === t.levels.length - 1);
      });
    }
  });

  it('mỗi bậc mạnh hơn hoặc bằng bậc trước', () => {
    for (const t of Object.values(TOWERS)) {
      for (let i = 1; i < t.levels.length; i++) {
        expect(t.levels[i].damage).toBeGreaterThanOrEqual(t.levels[i - 1].damage);
        expect(t.levels[i].rangeSq).toBeGreaterThanOrEqual(t.levels[i - 1].rangeSq);
        expect(t.levels[i].cooldownTicks).toBeLessThanOrEqual(t.levels[i - 1].cooldownTicks);
      }
    }
  });

  it('có đúng ba tháp mở từ đầu', () => {
    expect(STARTER_TOWER_IDS).toEqual(['arrow', 'cannon', 'frost']);
  });

  it('slowFactor nằm trong (0, 1]', () => {
    for (const t of Object.values(TOWERS)) {
      for (const lv of t.levels) {
        expect(lv.slowFactor).toBeGreaterThan(0);
        expect(lv.slowFactor).toBeLessThanOrEqual(1);
      }
    }
  });

  it('tháp có slowTicks > 0 thì phải có slowFactor < 1, và ngược lại', () => {
    for (const t of Object.values(TOWERS)) {
      for (const lv of t.levels) {
        expect(lv.slowTicks > 0).toBe(lv.slowFactor < 1);
      }
    }
  });
});

describe('số liệu enemy', () => {
  it('mọi giá trị đều dương và leak ít nhất 1', () => {
    for (const e of Object.values(ENEMIES)) {
      expect(e.hp).toBeGreaterThan(0);
      expect(e.speed).toBeGreaterThan(0);
      expect(e.armor).toBeGreaterThanOrEqual(0);
      expect(e.bounty).toBeGreaterThan(0);
      expect(e.leak).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('số liệu bản đồ', () => {
  it('có một entry cho mỗi id trong MAP_ORDER', () => {
    for (const id of MAP_ORDER) expect(MAPS[id]).toBeDefined();
    expect(Object.keys(MAPS).sort()).toEqual([...MAP_ORDER].sort());
  });

  it('mỗi bản đồ có ít nhất hai waypoint và một slot', () => {
    for (const m of Object.values(MAPS)) {
      expect(m.waypoints.length).toBeGreaterThanOrEqual(2);
      expect(m.slots.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('đường có chiều dài dương', () => {
    for (const m of Object.values(MAPS)) {
      expect(buildPath(m.waypoints).length).toBeGreaterThan(0);
    }
  });

  it('không có hai slot trùng toạ độ', () => {
    for (const m of Object.values(MAPS)) {
      const keys = m.slots.map((s) => `${s.x},${s.y}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('lịch đợt chỉ tham chiếu enemy id đã biết, và count dương', () => {
    for (const m of Object.values(MAPS)) {
      expect(m.waves.length).toBeGreaterThan(0);
      for (const wave of m.waves) {
        expect(wave.length).toBeGreaterThan(0);
        for (const e of wave) {
          expect(ENEMIES[e.enemyId]).toBeDefined();
          expect(e.count).toBeGreaterThan(0);
          expect(e.intervalTicks).toBeGreaterThan(0);
          expect(e.delayTicks).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('referenceLayout nằm trong danh sách slot và trong tháp đã biết', () => {
    for (const m of Object.values(MAPS)) {
      for (const p of m.referenceLayout) {
        expect(p.slotIndex).toBeGreaterThanOrEqual(0);
        expect(p.slotIndex).toBeLessThan(m.slots.length);
        expect(TOWER_IDS).toContain(p.towerId);
        expect(p.level).toBeGreaterThanOrEqual(1);
        expect(p.level).toBeLessThanOrEqual(TOWERS[p.towerId].levels.length);
      }
    }
  });

  it('referenceLayout không đặt hai tháp lên cùng một slot', () => {
    for (const m of Object.values(MAPS)) {
      const used = m.referenceLayout.map((p) => p.slotIndex);
      expect(new Set(used).size).toBe(used.length);
    }
  });

  it('referenceLayout chỉ dùng tháp mở từ đầu — nó phải thắng được ở mức nâng cấp tối thiểu', () => {
    for (const m of Object.values(MAPS)) {
      for (const p of m.referenceLayout) {
        expect(TOWERS[p.towerId].unlockedAtStart).toBe(true);
      }
    }
  });

  it('không có slot nào nằm ngay trên đường đi', () => {
    for (const m of Object.values(MAPS)) {
      const path = buildPath(m.waypoints);
      for (const slot of m.slots) {
        let minDist = Infinity;
        for (let s = 0; s <= path.length; s += 2) {
          const at = pathAt(path, s);
          minDist = Math.min(minDist, Math.hypot(at.x - slot.x, at.y - slot.y));
        }
        // Đường rộng 42 đơn vị khi vẽ, nên tâm slot phải cách trục đường > 21.
        expect(minDist).toBeGreaterThan(21);
      }
    }
  });
});

