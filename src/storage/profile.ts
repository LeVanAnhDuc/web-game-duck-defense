import type { UpgradeState } from '../core/upgrades';
import type { Locale } from '../i18n';
import { MAP_ORDER, type MapId } from '../data/maps';
import { UPGRADE_TREE, type UpgradeNodeId } from '../data/upgradeTree';

/**
 * Tiến trình của người chơi. MỘT object, MỘT key — ADR-0005.
 *
 * Không lưu gì suy ra được: bản đồ nào đang mở là HÀM của `maps` + `upgrades`,
 * không phải một trường riêng. Hai nguồn sự thật cho cùng một câu hỏi là cách
 * chắc chắn nhất để chúng lệch nhau.
 */
export type MapRecord = {
  cleared: boolean;
  /** Đợt xa nhất từng tới, 1-based. 0 = chưa chơi. */
  bestWave: number;
  /** Số mạng còn lại ở lần thắng tốt nhất. 0 = chưa thắng. */
  bestLives: number;
};

export type Profile = {
  schemaVersion: 1;
  locale: Locale;
  cores: number;
  upgrades: UpgradeState;
  maps: Record<MapId, MapRecord>;
  settings: { music: number; sfx: number };
  /** Bản đồ chơi gần nhất, để nút "chơi tiếp" biết đi đâu. */
  lastMap: MapId | null;
};

/*
 * KHÔNG có `unlockedTowers` ở đây, và đó là điểm mấu chốt.
 *
 * Tháp nào đã mở là HÀM của `upgrades` — `applyUpgrades` đọc các node
 * `unlockTower` và trả về danh sách. Lưu thêm một bản riêng là nguồn sự thật thứ
 * hai cho cùng một câu hỏi, đúng thứ chính file này cấm ở đoạn trên, và nó
 * không được đọc ở đâu cả nên có thể lệch âm thầm sau một lần sửa dữ liệu.
 *
 * Profile của phiên bản trước có thể còn mang trường đó; `parseProfile` bỏ qua
 * khoá lạ nên không cần migrate và `schemaVersion` giữ nguyên là 1.
 */

export const PROFILE_KEY = 'phongtuyen.profile';
export const SCHEMA_VERSION = 1;

export type LoadResult = {
  profile: Profile;
  /**
   * TOÀN BỘ profile không đọc được — JSON vỡ, hoặc `schemaVersion` sai. Bản cũ
   * đã được giữ lại dưới key `.corrupt.<ts>` và tiến trình bắt đầu lại từ đầu.
   */
  recovered: boolean;
  /**
   * Profile đọc được nhưng có TRƯỜNG phải thay bằng mặc định (sai kiểu, ngoài
   * khoảng, node của phiên bản khác).
   *
   * Tách khỏi `recovered` là cố ý: mất cả tiến trình vì một trường sai kiểu là
   * quá đắt, nhưng âm thầm sửa rồi không nói gì thì người chơi mất `cores` mà
   * không biết. Nên: sửa được thì sửa, và VẪN nói.
   */
  repaired: boolean;
  /** `localStorage` ghi được hay không (tab riêng tư, hết quota, bị chặn). */
  writable: boolean;
};

export function emptyProfile(): Profile {
  const maps = {} as Record<MapId, MapRecord>;
  for (const id of MAP_ORDER) maps[id] = { cleared: false, bestWave: 0, bestLives: 0 };
  return {
    schemaVersion: SCHEMA_VERSION,
    locale: 'vi',
    cores: 0,
    upgrades: {},
    maps,
    settings: { music: 0.5, sfx: 0.8 },
    lastMap: null,
  };
}

/* ── kiểm kiểu ──────────────────────────────────────────────────────────────
   Dữ liệu từ `localStorage` là KHÔNG ĐÁNG TIN (NFR-SEC-07): người chơi sửa
   được bằng devtools trong năm giây, và một phiên bản cũ của game có thể đã ghi
   một hình dạng khác. Mỗi trường được kiểm riêng và có giá trị thay thế. */

/** Ghi nhận đã phải thay một trường. Đặt lại ở đầu mỗi lần parse. */
let repairs = 0;

const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    repairs++;
    return fallback;
  }
  const clamped = Math.min(max, Math.max(min, v));
  if (clamped !== v) repairs++;
  return clamped;
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function parseUpgrades(v: unknown): UpgradeState {
  if (!isPlainObject(v)) return {};
  const out: UpgradeState = {};
  for (const [key, raw] of Object.entries(v)) {
    const node = UPGRADE_TREE[key as UpgradeNodeId];
    if (!node) {
      repairs++; // node của một phiên bản khác: bỏ, không throw
      continue;
    }
    const level = num(raw, 0, 0, node.maxLevel);
    if (level > 0) out[key as UpgradeNodeId] = Math.floor(level);
  }
  return out;
}

function parseMaps(v: unknown): Record<MapId, MapRecord> {
  const out = emptyProfile().maps;
  if (!isPlainObject(v)) return out;
  for (const key of Object.keys(v)) {
    if (!(MAP_ORDER as string[]).includes(key)) repairs++;
  }
  for (const id of MAP_ORDER) {
    const raw = v[id];
    if (!isPlainObject(raw)) continue;
    out[id] = {
      cleared: raw.cleared === true,
      bestWave: Math.floor(num(raw.bestWave, 0, 0, 999)),
      bestLives: Math.floor(num(raw.bestLives, 0, 0, 999)),
    };
  }
  return out;
}

function parseProfile(raw: unknown): { profile: Profile; repaired: boolean } | null {
  if (!isPlainObject(raw)) return null;
  if (raw.schemaVersion !== SCHEMA_VERSION) return null;

  repairs = 0;
  const base = emptyProfile();

  if (raw.locale !== 'en' && raw.locale !== 'vi') repairs++;
  if (raw.lastMap !== null && raw.lastMap !== undefined
      && !(typeof raw.lastMap === 'string' && (MAP_ORDER as string[]).includes(raw.lastMap))) {
    repairs++;
  }

  const profile: Profile = {
    schemaVersion: SCHEMA_VERSION,
    locale: raw.locale === 'en' ? 'en' : 'vi',
    cores: Math.floor(num(raw.cores, 0, 0, Number.MAX_SAFE_INTEGER)),
    upgrades: parseUpgrades(raw.upgrades),
    maps: parseMaps(raw.maps),
    settings: isPlainObject(raw.settings)
      ? { music: num(raw.settings.music, 0.5, 0, 1), sfx: num(raw.settings.sfx, 0.8, 0, 1) }
      : base.settings,
    lastMap:
      typeof raw.lastMap === 'string' && (MAP_ORDER as string[]).includes(raw.lastMap)
        ? (raw.lastMap as MapId)
        : null,
  };

  return { profile, repaired: repairs > 0 };
}

/* ── đọc / ghi ───────────────────────────────────────────────────────────── */

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null; // trình duyệt chặn hẳn việc truy cập
  }
};

function probeWritable(store: Storage): boolean {
  const key = `${PROFILE_KEY}.probe`;
  try {
    store.setItem(key, '1');
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Đọc profile. **KHÔNG BAO GIỜ throw, KHÔNG BAO GIỜ xoá** — `invariants.md` #10.
 *
 * Dữ liệu không đọc được thì đổi tên thành `<key>.corrupt.<timestamp>` rồi bắt
 * đầu profile mới. Người chơi mất tiến trình vẫn hơn là mất tiến trình *và*
 * không biết vì sao (ADR-0005 §3).
 */
export function loadProfile(): LoadResult {
  const store = storage();
  if (!store) return { profile: emptyProfile(), recovered: false, repaired: false, writable: false };

  const writable = probeWritable(store);

  let raw: string | null;
  try {
    raw = store.getItem(PROFILE_KEY);
  } catch {
    return { profile: emptyProfile(), recovered: false, repaired: false, writable };
  }

  if (raw === null) return { profile: emptyProfile(), recovered: false, repaired: false, writable };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const parseResult = parseProfile(parsed);
  if (parseResult) {
    return { profile: parseResult.profile, recovered: false, repaired: parseResult.repaired, writable };
  }

  // Giữ lại bản không đọc được. Nếu ghi cũng không được thì thôi — vẫn không xoá.
  try {
    store.setItem(`${PROFILE_KEY}.corrupt.${Date.now()}`, raw);
    store.removeItem(PROFILE_KEY);
  } catch {
    /* không ghi được thì để nguyên; đọc lần sau lại nhận diện là hỏng */
  }

  return { profile: emptyProfile(), recovered: true, repaired: false, writable };
}

/** Ghi profile. Trả về `false` nếu không ghi được — game vẫn phải chơi tiếp. */
export function saveProfile(profile: Profile): boolean {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

/* ── suy ra, không lưu ──────────────────────────────────────────────────── */

/**
 * Bản đồ nào đang mở. Là HÀM của tiến trình, không phải một trường được lưu —
 * ADR-0005 §3. Bản đồ 1 luôn mở; bản đồ n+1 mở khi bản đồ n đã qua.
 */
export function unlockedMaps(profile: Profile): MapId[] {
  const out: MapId[] = [];
  for (let i = 0; i < MAP_ORDER.length; i++) {
    const id = MAP_ORDER[i];
    if (i === 0 || profile.maps[MAP_ORDER[i - 1]]?.cleared) out.push(id);
    else break;
  }
  return out;
}

/** `null` = đang mở. Ngược lại trả về bản đồ cần qua trước — FR-13 đòi LÝ DO. */
export function lockReason(profile: Profile, id: MapId): MapId | null {
  const index = MAP_ORDER.indexOf(id);
  if (index <= 0) return null;
  const previous = MAP_ORDER[index - 1];
  return profile.maps[previous]?.cleared ? null : previous;
}
