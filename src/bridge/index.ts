/**
 * Cầu nối giữa `ui/` (React) và `game/` (Phaser). Chỗ DUY NHẤT hai bên nói
 * chuyện — ADR-0004.
 *
 * Hai chiều, cố ý hẹp:
 *   • XUỐNG: UI đẩy Ý ĐỊNH vào hàng đợi. Không bao giờ đẩy state.
 *   • LÊN:   game đẩy SNAPSHOT ở ≤ 10Hz. Không bao giờ mỗi frame.
 *
 * Không import React, không import Phaser — `architecture.md` §3.
 */

import type { BattleSnapshot, Intent } from './types';

export type { BattleSnapshot, Intent, BattleSpeed, Selection, SelectedSlot, SelectedTower } from './types';

/** 10Hz. Là bất biến `invariants.md` #7, không phải một tối ưu hoá. */
export const SNAPSHOT_INTERVAL_MS = 100;

let queue: Intent[] = [];

export function pushIntent(intent: Intent): void {
  queue.push(intent);
}

/** Rút hết hàng đợi. `game/` gọi ở RANH GIỚI TICK — `invariants.md` #5. */
export function drainIntents(): Intent[] {
  if (queue.length === 0) return [];
  const out = queue;
  queue = [];
  return out;
}

type Listener = (s: BattleSnapshot) => void;

let latest: BattleSnapshot | null = null;
const listeners = new Set<Listener>();

export function publishSnapshot(snapshot: BattleSnapshot): void {
  latest = snapshot;
  for (const fn of listeners) fn(snapshot);
}

export function getSnapshot(): BattleSnapshot | null {
  return latest;
}

/** Trả về hàm bỏ đăng ký. */
export function subscribeSnapshot(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Gọi khi vào/rời màn trận đấu, để trận sau không kế thừa gì của trận trước.
 *
 * KHÔNG xoá danh sách người đăng ký, và đó là điểm quan trọng: `useSnapshot`
 * đăng ký qua `useSyncExternalStore`, và đăng ký đó xảy ra TRƯỚC effect khởi
 * động Phaser. Xoá listener ở đây sẽ gỡ đúng subscriber của React, và
 * `useSyncExternalStore` chỉ đăng ký lại khi hàm `subscribe` đổi identity — tức
 * là không bao giờ. Kết quả: snapshot không tới UI, màn trận đấu trắng trơn,
 * và không có một dòng lỗi nào trong console.
 *
 * Người đăng ký tự gỡ mình khi unmount. Đây không phải việc của hàm này.
 */
export function resetBridge(): void {
  queue = [];
  latest = null;
}
