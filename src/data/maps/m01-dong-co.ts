import type { MapDef } from './index';
import { w } from './wave';

/**
 * Bản đồ 1 — Đồng Cỏ. Bản đồ dạy người chơi.
 * Waypoint và slot lấy đúng từ mockup đã duyệt (`Main.dc.html`).
 * Đường dài ~1072 đơn vị, 10 slot, 12 đợt.
 */
export const M01: MapDef = {
  id: 'm01',
  waypoints: [
    { x: -12, y: 84 }, { x: 128, y: 84 }, { x: 128, y: 196 }, { x: 64, y: 196 },
    { x: 64, y: 316 }, { x: 252, y: 316 }, { x: 252, y: 148 }, { x: 344, y: 148 },
    { x: 344, y: 268 }, { x: 412, y: 268 },
  ],
  slots: [
    { x: 170, y: 40 }, { x: 216, y: 40 }, { x: 26, y: 240 }, { x: 170, y: 240 },
    { x: 300, y: 60 }, { x: 110, y: 370 }, { x: 216, y: 370 },
    { x: 26, y: 140 }, { x: 170, y: 140 }, { x: 300, y: 212 },
  ],
  startGold: 260,
  startLives: 20,
  waves: [
    [w('grunt', 5, 48)],
    [w('grunt', 8, 42)],
    [w('grunt', 6, 40), w('runner', 3, 30, 120)],
    [w('runner', 8, 26)],
    [w('grunt', 10, 34), w('armored', 2, 90, 100)],
    [w('armored', 4, 80)],
    [w('grunt', 14, 28), w('runner', 6, 24, 150)],
    [w('armored', 5, 70), w('runner', 8, 22, 130)],
    [w('grunt', 18, 24)],
    [w('armored', 7, 60), w('grunt', 12, 26, 90)],
    [w('runner', 16, 18), w('armored', 4, 70, 110)],
    [w('armored', 10, 52), w('grunt', 16, 22, 80), w('runner', 10, 18, 210)],
  ],
  referenceLayout: [
    { slotIndex: 7, towerId: 'arrow', level: 3 },
    { slotIndex: 8, towerId: 'cannon', level: 3 },
    { slotIndex: 9, towerId: 'frost', level: 2 },
    { slotIndex: 3, towerId: 'arrow', level: 3 },
    { slotIndex: 0, towerId: 'cannon', level: 2 },
    { slotIndex: 5, towerId: 'arrow', level: 2 },
  ],
};
