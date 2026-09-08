/**
 * Định nghĩa bản đồ. SỐ, không logic — `architecture.md` §3.
 *
 * Đơn vị bản đồ là không gian 400×400 mà mockup đã duyệt dùng, nên bố cục
 * trên canvas chuyển thẳng vào đây không phải quy đổi.
 */

import type { EnemyTypeId } from '../enemies';
import type { TowerTypeId } from '../towers';
import { M01 } from './m01-dong-co';
import { M02 } from './m02-hem-da';
import { M03 } from './m03-dam-suong';
import { M04 } from './m04-deo-gio';
import { M05 } from './m05-lo-ren-cu';

export type MapId = 'm01' | 'm02' | 'm03' | 'm04' | 'm05';

export type Point = { x: number; y: number };

export type WaveEntry = {
  enemyId: EnemyTypeId;
  count: number;
  intervalTicks: number;
  /** Tick chờ sau khi phần tử trước của cùng đợt đã sinh xong. */
  delayTicks: number;
};

export type MapDef = {
  id: MapId;
  /** Polyline enemy đi trên đó. Điểm đầu và cuối nằm ngoài khung để enemy
   *  đi vào và đi ra khỏi màn hình. */
  waypoints: Point[];
  /** Ô đặt tháp được. Thứ tự cố định — `referenceLayout` trỏ vào chỉ số này. */
  slots: Point[];
  startGold: number;
  startLives: number;
  /** `waves[i]` là đợt thứ i+1. */
  waves: WaveEntry[][];
  /**
   * Bố cục tháp tham chiếu — KHÔNG phải nội dung game, mà là dữ liệu test cho
   * FR-32. Nó sống trong `MapDef` chứ không trong file test vì nó phải được sửa
   * CÙNG LÚC với bản đồ; tách ra là để chúng lệch nhau.
   */
  referenceLayout: { slotIndex: number; towerId: TowerTypeId; level: number }[];
};

export const MAPS: Record<MapId, MapDef> = {
  m01: M01,
  m02: M02,
  m03: M03,
  m04: M04,
  m05: M05,
};

/** Thứ tự mở khoá. `unlockedMaps()` dựa vào thứ tự này. */
export const MAP_ORDER: MapId[] = ['m01', 'm02', 'm03', 'm04', 'm05'];

export const waveCount = (id: MapId): number => MAPS[id].waves.length;
