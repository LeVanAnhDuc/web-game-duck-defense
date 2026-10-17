import type { MapDef } from './index';
import { w } from './wave';

/**
 * Bản đồ 5 — Lò Rèn Cũ. Bản đồ cuối: 18 đợt, rất nhiều enemy có giáp, nên nó
 * thưởng cho tháp xuyên giáp (`venom`, mở qua cây nâng cấp) và cho nhánh Sát
 * thương. Đường ~1214 đơn vị, 12 slot.
 */
export const M05: MapDef = {
  id: 'm05',
  waypoints: [
    { x: -12, y: 370 }, { x: 60, y: 370 }, { x: 60, y: 60 }, { x: 180, y: 60 },
    { x: 180, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 60 }, { x: 412, y: 60 },
  ],
  slots: [
    { x: 120, y: 110 }, { x: 120, y: 180 }, { x: 120, y: 250 },
    { x: 240, y: 110 }, { x: 240, y: 180 }, { x: 240, y: 250 },
    { x: 360, y: 120 }, { x: 360, y: 200 }, { x: 360, y: 280 },
    { x: 20, y: 150 }, { x: 20, y: 250 }, { x: 120, y: 330 },
  ],
  startGold: 320,
  startLives: 14,
  waves: [
    [w('armored', 5, 64)],
    [w('grunt', 16, 28), w('armored', 4, 70, 90)],
    [w('armored', 9, 56)],
    [w('runner', 20, 15), w('armored', 6, 62, 100)],
    [w('armored', 13, 50)],
    [w('grunt', 24, 22), w('armored', 8, 58, 90)],
    [w('armored', 17, 46), w('runner', 14, 16, 110)],
    [w('runner', 30, 11), w('armored', 10, 54, 120)],
    [w('armored', 21, 42)],
    [w('grunt', 32, 18), w('armored', 14, 50, 80)],
    [w('armored', 25, 38), w('runner', 18, 14, 100)],
    [w('runner', 36, 10), w('armored', 16, 46, 110)],
    [w('armored', 30, 35), w('grunt', 28, 18, 90)],
    [w('armored', 34, 32), w('runner', 24, 12, 100)],
    [w('grunt', 40, 15), w('armored', 20, 42, 80), w('runner', 24, 12, 200)],
    [w('armored', 40, 29), w('runner', 30, 10, 110)],
    [w('armored', 44, 27), w('grunt', 36, 15, 90), w('runner', 28, 10, 220)],
    [w('armored', 52, 24), w('runner', 40, 8, 100), w('grunt', 40, 14, 240)],
  ],
  referenceLayout: [
    { slotIndex: 0, towerId: 'cannon', level: 3 },
    { slotIndex: 1, towerId: 'cannon', level: 3 },
    { slotIndex: 2, towerId: 'cannon', level: 3 },
    { slotIndex: 3, towerId: 'cannon', level: 3 },
    { slotIndex: 4, towerId: 'cannon', level: 3 },
    { slotIndex: 5, towerId: 'cannon', level: 3 },
    { slotIndex: 6, towerId: 'arrow', level: 3 },
    { slotIndex: 7, towerId: 'arrow', level: 3 },
    { slotIndex: 8, towerId: 'arrow', level: 3 },
    { slotIndex: 9, towerId: 'frost', level: 3 },
    { slotIndex: 10, towerId: 'frost', level: 3 },
    { slotIndex: 11, towerId: 'arrow', level: 3 },
  ],
};
