import type { EnemyTypeId } from '../enemies';
import type { WaveEntry } from './index';

/**
 * Shim viết tắt cho một phần tử lịch đợt. Không phải logic game — chỉ là cách
 * viết `WaveEntry` gọn hơn, để 18 đợt của một bản đồ đọc được thành bảng thay vì
 * thành một tường object. `architecture.md` §3 cấm logic trong `data/`, không
 * cấm cách viết ngắn.
 */
export const w = (
  enemyId: EnemyTypeId,
  count: number,
  intervalTicks: number,
  delayTicks = 0,
): WaveEntry => ({ enemyId, count, intervalTicks, delayTicks });
