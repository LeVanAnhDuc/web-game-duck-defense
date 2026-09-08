// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  PROFILE_KEY, emptyProfile, loadProfile, lockReason, saveProfile, unlockedMaps,
} from '../../src/storage/profile';
import { MAP_ORDER } from '../../src/data/maps';

const corruptKeys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith(`${PROFILE_KEY}.corrupt.`));

beforeEach(() => localStorage.clear());

/**
 * NFR-REL-04 · invariants #10 — đọc profile KHÔNG BAO GIỜ throw và KHÔNG BAO GIỜ
 * xoá bản không đọc được. Sáu dạng rác, mỗi dạng một test.
 */
describe('loadProfile · dữ liệu rác', () => {
  const cases: [string, string][] = [
    ['không phải JSON', '{{{'],
    ['là mảng', '[1,2,3]'],
    ['thiếu schemaVersion', JSON.stringify({ cores: 5 })],
    ['schemaVersion lạ', JSON.stringify({ schemaVersion: 99, cores: 5 })],
    ['là chuỗi rỗng', ''],
    ['là null theo nghĩa JSON', 'null'],
  ];

  for (const [name, raw] of cases) {
    it(`hồi phục từ ${name}, và GIỮ LẠI bản cũ`, () => {
      localStorage.setItem(PROFILE_KEY, raw);
      const { profile, recovered } = loadProfile();

      expect(profile.schemaVersion).toBe(1);
      expect(recovered).toBe(true);

      const kept = corruptKeys();
      expect(kept).toHaveLength(1);
      expect(localStorage.getItem(kept[0])).toBe(raw);
      expect(localStorage.getItem(PROFILE_KEY)).toBeNull();
    });
  }

  it('không có gì trong máy thì KHÔNG coi là hỏng', () => {
    const { profile, recovered } = loadProfile();
    expect(recovered).toBe(false);
    expect(profile.cores).toBe(0);
    expect(corruptKeys()).toHaveLength(0);
  });

});

/**
 * Một TRƯỜNG sai kiểu KHÔNG phải profile hỏng: `schemaVersion` đúng nên profile
 * vẫn đọc được, chỉ trường đó bị thay bằng mặc định. Mất cả tiến trình vì một
 * trường là quá đắt — nhưng âm thầm sửa rồi không nói thì người chơi mất `cores`
 * mà không biết, nên `repaired` được báo lên UI.
 */
describe('loadProfile · trường sai kiểu thì SỬA, không huỷ', () => {
  const repairCases: [string, unknown][] = [
    ['cores là chuỗi', { cores: 'rất nhiều' }],
    ['cores là NaN sau JSON (null)', { cores: null }],
    ['locale lạ', { locale: 'fr' }],
    ['upgrades là mảng', { upgrades: [1, 2] }],
    ['settings là số', { settings: 7 }],
    ['maps có bản đồ lạ', { maps: { mXX: { cleared: true } } }],
    ['lastMap trỏ bản đồ không có', { lastMap: 'm99' }],
  ];

  for (const [name, patch] of repairCases) {
    it(`sửa được: ${name}`, () => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ schemaVersion: 1, ...patch }));
      const { profile, recovered, repaired } = loadProfile();
      expect(recovered).toBe(false);
      expect(repaired).toBe(true);
      expect(profile.schemaVersion).toBe(1);
      expect(Number.isFinite(profile.cores)).toBe(true);
      expect(corruptKeys()).toHaveLength(0);
    });
  }

  it('cores là chuỗi thì về 0, không phải NaN', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ schemaVersion: 1, cores: 'nhiều' }));
    expect(loadProfile().profile.cores).toBe(0);
  });

  it('profile hoàn toàn đúng thì KHÔNG báo repaired', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(emptyProfile()));
    const { recovered, repaired } = loadProfile();
    expect(recovered).toBe(false);
    expect(repaired).toBe(false);
  });
});

describe('loadProfile · profile hợp lệ', () => {
  it('giữ nguyên profile đúng', () => {
    const good = { ...emptyProfile(), cores: 340, locale: 'en' as const, lastMap: 'm02' as const };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(good));
    const { profile, recovered } = loadProfile();
    expect(recovered).toBe(false);
    expect(profile.cores).toBe(340);
    expect(profile.locale).toBe('en');
    expect(profile.lastMap).toBe('m02');
  });

  it('bỏ qua node nâng cấp của một phiên bản khác, không throw', () => {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...emptyProfile(), upgrades: { startGold: 2, nodeKhongTonTai: 5 } }),
    );
    const { profile } = loadProfile();
    expect(profile.upgrades.startGold).toBe(2);
    expect('nodeKhongTonTai' in profile.upgrades).toBe(false);
  });

  it('kẹp bậc nâng cấp vượt maxLevel', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...emptyProfile(), upgrades: { startGold: 99 } }));
    expect(loadProfile().profile.upgrades.startGold).toBe(4);
  });

  it('kẹp âm lượng vào [0, 1]', () => {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...emptyProfile(), settings: { music: 5, sfx: -2 } }),
    );
    const { settings } = loadProfile().profile;
    expect(settings.music).toBe(1);
    expect(settings.sfx).toBe(0);
  });

  it('lastMap trỏ tới bản đồ không tồn tại thì về null', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...emptyProfile(), lastMap: 'm99' }));
    expect(loadProfile().profile.lastMap).toBeNull();
  });

  it('bản đồ lạ trong `maps` bị bỏ, bản đồ thiếu được điền mặc định', () => {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...emptyProfile(), maps: { m01: { cleared: true, bestWave: 12 }, mXX: {} } }),
    );
    const { maps } = loadProfile().profile;
    expect(maps.m01.cleared).toBe(true);
    expect(maps.m01.bestWave).toBe(12);
    for (const id of MAP_ORDER) expect(maps[id]).toBeDefined();
    expect('mXX' in maps).toBe(false);
  });
});

describe('saveProfile', () => {
  it('ghi rồi đọc lại ra đúng thứ đã ghi', () => {
    const p = { ...emptyProfile(), cores: 777 };
    expect(saveProfile(p)).toBe(true);
    expect(loadProfile().profile.cores).toBe(777);
  });

  it('NFR-REL-05 — ghi thất bại trả về false, KHÔNG throw', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('QuotaExceededError');
    };
    try {
      expect(saveProfile(emptyProfile())).toBe(false);
      expect(loadProfile().writable).toBe(false);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it('đọc được ngay cả khi setItem thất bại — chỉ mất khả năng ghi', () => {
    saveProfile({ ...emptyProfile(), cores: 42 });
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('QuotaExceededError');
    };
    try {
      const { profile, writable } = loadProfile();
      expect(writable).toBe(false);
      expect(profile.cores).toBe(42);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it('rác KHÔNG bị xoá kể cả khi không ghi được (invariants #10)', () => {
    localStorage.setItem(PROFILE_KEY, '{{{');
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('QuotaExceededError');
    };
    try {
      const { recovered } = loadProfile();
      expect(recovered).toBe(true);
      expect(localStorage.getItem(PROFILE_KEY)).toBe('{{{');
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});

describe('mở bản đồ — suy ra, không lưu (ADR-0005 §3)', () => {
  it('bản đồ đầu luôn mở', () => {
    expect(unlockedMaps(emptyProfile())).toEqual(['m01']);
  });

  it('qua bản đồ n thì mở bản đồ n+1', () => {
    const p = emptyProfile();
    p.maps.m01.cleared = true;
    expect(unlockedMaps(p)).toEqual(['m01', 'm02']);
    p.maps.m02.cleared = true;
    expect(unlockedMaps(p)).toEqual(['m01', 'm02', 'm03']);
  });

  it('qua bản đồ 3 mà chưa qua bản đồ 2 thì KHÔNG mở bản đồ 4', () => {
    const p = emptyProfile();
    p.maps.m01.cleared = true;
    p.maps.m03.cleared = true;
    expect(unlockedMaps(p)).toEqual(['m01', 'm02']);
  });

  it('qua hết thì mở hết', () => {
    const p = emptyProfile();
    for (const id of MAP_ORDER) p.maps[id].cleared = true;
    expect(unlockedMaps(p)).toEqual([...MAP_ORDER]);
  });

  it('FR-13 — bản đồ khoá trả về LÝ DO, không chỉ trả false', () => {
    const p = emptyProfile();
    expect(lockReason(p, 'm01')).toBeNull();
    expect(lockReason(p, 'm02')).toBe('m01');
    p.maps.m01.cleared = true;
    expect(lockReason(p, 'm02')).toBeNull();
    expect(lockReason(p, 'm03')).toBe('m02');
  });
});
