import { stepSpawn } from './spawn';
import { stepAdvance } from './advance';
import { stepFire } from './fire';
import { stepProjectiles } from './projectiles';
import { stepCleanup } from './cleanup';
import type { Battle } from '../battle';

/** Trận đã kết thúc chưa. Là hàm chứ không phải so sánh tại chỗ, vì `phase`
 *  bị các bước bên dưới thay đổi và TypeScript không thấy điều đó. */
const isOver = (b: Battle): boolean => b.state.phase === 'won' || b.state.phase === 'lost';

/**
 * MỘT TICK.
 *
 * Thứ tự năm bước dưới đây là bất biến `invariants.md` #1, và cả file này tồn
 * tại để thứ tự đó được viết ĐÚNG MỘT LẦN, ở một chỗ, cạnh lý do của nó.
 *
 * Đảo bước 2 và 3 thì mọi phát bắn nhắm vị trí của frame trước: game vẫn chạy,
 * mọi test khác vẫn xanh, chỉ có `tests/core/step-order.test.ts` đỏ.
 */
export function step(battle: Battle): void {
  if (isOver(battle)) return;

  stepSpawn(battle); // 1 · sinh enemy theo lịch
  stepAdvance(battle); // 2 · enemy tiến, leak, trừ mạng
  if (isOver(battle)) return; // hết mạng thì dừng ngay tại đây

  stepFire(battle); // 3 · tháp ngắm và bắn
  stepProjectiles(battle); // 4 · đạn bay và trúng
  stepCleanup(battle); // 5 · dọn xác, xét thắng/thua

  battle.state.tick++;
}

export { stepSpawn, stepAdvance, stepFire, stepProjectiles, stepCleanup };
