import type { BattlePhase, EntityId } from '../core/types';
import type { EnemyTypeId } from '../data/enemies';
import type { TowerTypeId } from '../data/towers';

export type { Intent } from '../core/battle';

/** Tốc độ trận. Là SỐ TICK MỖI FRAME, không phải hệ số nhân dt — invariants #4. */
export type BattleSpeed = 1 | 2 | 3;

export type SelectedSlot = { kind: 'slot'; slotIndex: number; x: number; y: number };

export type SelectedTower = {
  kind: 'tower';
  towerId: EntityId;
  typeId: TowerTypeId;
  slotIndex: number;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
  upgradeCost: number | null;
  sellValue: number;
  damage: number;
  nextDamage: number | null;
};

export type Selection = SelectedSlot | SelectedTower | null;

/**
 * Bản rút gọn của state trận, đẩy sang React ở ≤ 10Hz — `invariants.md` #7.
 *
 * Cố ý KHÔNG chứa danh sách enemy hay đạn: chúng đổi mỗi tick, chỉ dùng để vẽ,
 * và vẽ là việc của canvas. Thanh máu của enemy vì thế cũng vẽ trong canvas chứ
 * không trong HUD — với độ trễ 100ms thì thanh máu sẽ thấy rõ là lệch.
 */
export type BattleSnapshot = {
  tick: number;
  phase: BattlePhase;
  gold: number;
  lives: number;
  /** 1-based để hiện trực tiếp lên UI. */
  waveNumber: number;
  waveCount: number;
  speed: BattleSpeed;
  paused: boolean;
  selection: Selection;
  /**
   * Chỉ số các ô ĐÃ CÓ THÁP.
   *
   * Cần vì lớp overlay DOM phải đọc được nhãn đúng cho MỌI ô, không chỉ ô đang
   * chọn. Thiếu nó, người dùng screen reader Tab qua bàn chơi và mọi ô đều được
   * đọc là "Ô số N" — không phân biệt được ô nào đã xây.
   */
  occupiedSlots: number[];
  /** Thành phần đợt tiếp theo, gộp theo loại (FR-24). */
  nextWave: { enemyId: EnemyTypeId; count: number }[];
  /** Giá xây từng loại tháp đã mở, và có đủ tiền hay không. */
  buildOptions: { towerId: TowerTypeId; cost: number; affordable: boolean }[];
  killed: number;
  leaked: number;
};
