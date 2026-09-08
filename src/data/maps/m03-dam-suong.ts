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
  startGold: 280,
  startLives: 16,
  waves: [
    [w('grunt', 8, 38)],
    [w('grunt', 12, 32), w('runner', 4, 24, 90)],
    [w('runner', 14, 20)],
    [w('armored', 4, 70), w('grunt', 10, 30, 100)],
    [w('armored', 7, 62)],
    [w('runner', 18, 16), w('grunt', 12, 26, 120)],
    [w('armored', 10, 56), w('runner', 10, 18, 110)],
    [w('grunt', 26, 20)],
    [w('armored', 12, 52), w('grunt', 16, 22, 90)],
    [w('runner', 26, 13)],
    [w('armored', 16, 46), w('runner', 14, 15, 100)],
    [w('grunt', 32, 17), w('armored', 10, 52, 80)],
    [w('armored', 20, 42), w('runner', 20, 13, 110)],
    [w('armored', 24, 38), w('grunt', 28, 17, 90), w('runner', 22, 12, 220)],
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
