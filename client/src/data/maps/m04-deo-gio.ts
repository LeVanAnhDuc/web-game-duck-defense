import type { MapDef } from './index';
import { w } from './wave';

/**
 * Bản đồ 4 — Đèo Gió. Đường trung bình (~1164 đơn vị), 12 slot, 16 đợt.
 * Nhiều runner: bản đồ này thưởng cho tháp Băng.
 */
export const M04: MapDef = {
  id: 'm04',
  waypoints: [
    { x: -12, y: 40 }, { x: 300, y: 40 }, { x: 300, y: 140 }, { x: 80, y: 140 },
    { x: 80, y: 240 }, { x: 340, y: 240 }, { x: 340, y: 340 }, { x: 412, y: 340 },
  ],
  slots: [
    { x: 60, y: 90 }, { x: 150, y: 90 }, { x: 250, y: 90 }, { x: 360, y: 90 },
    { x: 40, y: 190 }, { x: 150, y: 190 }, { x: 230, y: 190 }, { x: 310, y: 190 },
    { x: 60, y: 300 }, { x: 150, y: 300 }, { x: 250, y: 300 }, { x: 390, y: 290 },
  ],
  startGold: 300,
  startLives: 16,
  waves: [
    [w('runner', 10, 24)],
    [w('grunt', 14, 30), w('runner', 6, 20, 90)],
    [w('runner', 18, 16)],
    [w('armored', 5, 66), w('runner', 10, 18, 100)],
    [w('runner', 24, 13)],
    [w('armored', 9, 58), w('grunt', 14, 26, 100)],
    [w('runner', 28, 12), w('armored', 6, 62, 130)],
    [w('grunt', 30, 19)],
    [w('armored', 14, 50), w('runner', 16, 14, 90)],
    [w('runner', 34, 10)],
    [w('armored', 18, 44), w('grunt', 20, 20, 80)],
    [w('runner', 30, 11), w('armored', 12, 50, 100)],
    [w('grunt', 36, 16), w('runner', 20, 13, 140)],
    [w('armored', 32, 32), w('runner', 32, 9, 90)],
    [w('runner', 52, 7), w('armored', 22, 40, 100)],
    [w('armored', 38, 28), w('runner', 42, 7, 90), w('grunt', 40, 13, 210)],
  ],
  referenceLayout: [
    { slotIndex: 5, towerId: 'frost', level: 3 },
    { slotIndex: 6, towerId: 'cannon', level: 3 },
    { slotIndex: 1, towerId: 'cannon', level: 3 },
    { slotIndex: 2, towerId: 'cannon', level: 3 },
    { slotIndex: 0, towerId: 'arrow', level: 3 },
    { slotIndex: 4, towerId: 'frost', level: 3 },
    { slotIndex: 7, towerId: 'arrow', level: 3 },
    { slotIndex: 8, towerId: 'arrow', level: 3 },
    { slotIndex: 9, towerId: 'cannon', level: 3 },
    { slotIndex: 10, towerId: 'arrow', level: 3 },
    { slotIndex: 11, towerId: 'frost', level: 2 },
  ],
};
