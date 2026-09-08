import type { MapDef } from './index';
import { w } from './wave';

/**
 * Bản đồ 2 — Hẻm Đá. Đường rất dài (~1944 đơn vị) nên tháp có nhiều thời gian
 * bắn; đổi lại đợt đông hơn và có runner sớm. 11 slot, 14 đợt.
 */
export const M02: MapDef = {
  id: 'm02',
  waypoints: [
    { x: -12, y: 50 }, { x: 350, y: 50 }, { x: 350, y: 130 }, { x: 50, y: 130 },
    { x: 50, y: 210 }, { x: 350, y: 210 }, { x: 350, y: 290 }, { x: 50, y: 290 },
    { x: 50, y: 370 }, { x: 412, y: 370 },
  ],
  slots: [
    { x: 100, y: 90 }, { x: 200, y: 90 }, { x: 300, y: 90 },
    { x: 100, y: 170 }, { x: 200, y: 170 }, { x: 300, y: 170 },
    { x: 100, y: 250 }, { x: 200, y: 250 }, { x: 300, y: 250 },
    { x: 150, y: 330 }, { x: 280, y: 330 },
  ],
  startGold: 240,
  startLives: 18,
  waves: [
    [w('grunt', 8, 40)],
    [w('grunt', 10, 36), w('runner', 4, 26, 100)],
    [w('runner', 12, 22)],
    [w('grunt', 14, 30), w('armored', 3, 80, 110)],
    [w('armored', 6, 70)],
    [w('grunt', 18, 26), w('runner', 8, 20, 140)],
    [w('armored', 8, 60), w('runner', 10, 20, 120)],
    [w('runner', 20, 16)],
    [w('grunt', 24, 22), w('armored', 6, 64, 90)],
    [w('armored', 12, 54)],
    [w('runner', 24, 14), w('grunt', 18, 22, 130)],
    [w('armored', 18, 44), w('runner', 18, 14, 90)],
    [w('grunt', 38, 15), w('armored', 14, 48, 70), w('runner', 22, 12, 170)],
    [w('armored', 28, 38), w('runner', 32, 10, 100), w('grunt', 32, 15, 230)],
  ],
  referenceLayout: [
    { slotIndex: 1, towerId: 'cannon', level: 3 },
    { slotIndex: 4, towerId: 'cannon', level: 3 },
    { slotIndex: 7, towerId: 'cannon', level: 3 },
    { slotIndex: 0, towerId: 'arrow', level: 3 },
    { slotIndex: 3, towerId: 'frost', level: 3 },
    { slotIndex: 5, towerId: 'arrow', level: 3 },
    { slotIndex: 6, towerId: 'frost', level: 2 },
    { slotIndex: 9, towerId: 'arrow', level: 3 },
    { slotIndex: 10, towerId: 'cannon', level: 2 },
  ],
};
