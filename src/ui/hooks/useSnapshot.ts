import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribeSnapshot, type BattleSnapshot } from '../../bridge';

/**
 * Đọc snapshot của trận đấu.
 *
 * ĐĂNG KÝ, không hỏi vòng: snapshot chỉ được đẩy ở 10Hz (`invariants.md` #7),
 * nên React re-render tối đa 10 lần mỗi giây. Hỏi vòng theo frame sẽ đưa nó về
 * 60 lần/giây và giật cả game trên điện thoại — mà triệu chứng lại là "game
 * lag", không ai nghĩ tới React (NFR-PERF-07).
 */
export function useSnapshot(): BattleSnapshot | null {
  return useSyncExternalStore(subscribeSnapshot, getSnapshot, getSnapshot);
}
