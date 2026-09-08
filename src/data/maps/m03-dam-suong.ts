import type { MapDef } from './index';
import { w } from './wave';

/**
 * Bản đồ 3 — Đầm Sương. Đường NGẮN (~784 đơn vị): ít thời gian bắn, nên độ khó
 * đến từ hình bản đồ chứ không từ số lượng enemy. 9 slot, 14 đợt.
 */
export const M03: MapDef = {
  id: 'm03',
  waypoints: [
    { x: -12, y: 200 }, { x: 150, y: 200 }, { x: 150, y: 80 },
    { x: 280, y: 80 }, { x: 280, y: 320 }, { x: 412, y: 320 },
  ],
  slots: [
    { x: 70, y: 120 }, { x: 70, y: 280 }, { x: 215, y: 150 }, { x: 215, y: 250 },
    { x: 215, y: 40 }, { x: 350, y: 150 }, { x: 350, y: 240 },
    { x: 100, y: 60 }, { x: 100, y: 340 },
  ],
  startGold: 320,
  startLives: 16,
  waves: [
    [w('grunt', 6, 44)],
    [w('grunt', 9, 38)],
    [w('grunt', 8, 34), w('runner', 4, 26, 100)],
    [w('runner', 12, 22)],
    [w('grunt', 10, 30), w('armored', 3, 80, 120)],
    [w('armored', 5, 72)],
    [w('runner', 16, 18), w('grunt', 8, 28, 140)],
    [w('armored', 8, 62), w('runner', 10, 20, 120)],
    [w('grunt', 22, 22)],
    [w('armored', 12, 54), w('grunt', 14, 24, 100)],
    [w('runner', 24, 14)],
    [w('armored', 16, 48), w('grunt', 18, 20, 90)],
    [w('armored', 20, 42), w('runner', 20, 13, 110)],
    [w('armored', 24, 38), w('grunt', 26, 18, 90), w('runner', 22, 12, 220)],
  ],
  referenceLayout: [
    { slotIndex: 2, towerId: 'cannon', level: 3 },
    { slotIndex: 3, towerId: 'cannon', level: 3 },
    { slotIndex: 0, towerId: 'arrow', level: 3 },
    { slotIndex: 1, towerId: 'arrow', level: 3 },
    { slotIndex: 4, towerId: 'frost', level: 3 },
    { slotIndex: 5, towerId: 'cannon', level: 3 },
    { slotIndex: 6, towerId: 'arrow', level: 3 },
    { slotIndex: 7, towerId: 'frost', level: 2 },
    { slotIndex: 8, towerId: 'arrow', level: 2 },
  ],
};
