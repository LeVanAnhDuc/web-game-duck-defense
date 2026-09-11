import type { BattleSnapshot } from '@/bridge';

/**
 * Số đợt ĐÃ XONG, dùng cho thanh tiến độ và cho `aria-valuenow`.
 *
 * Tách ra thành module thuần để test được trực tiếp: đây là một off-by-one, và
 * off-by-one thì kiểm bằng bảng giá trị rẻ và chắc hơn nhiều so với đọc
 * `aria-valuenow` qua trình duyệt.
 *
 * `waveNumber = waveIndex + 1`, và `waveIndex` vốn đã bằng số đợt đã hoàn thành.
 * Bản đầu trừ 1 CHỈ ở pha `wave`, nên nó đếm thừa ở pha `prep`: vào trận mới,
 * thanh hiện 1/12 trước khi người chơi đánh đợt nào, rồi TỤT về 0 khi đợt 1 bắt
 * đầu, rồi nhảy lên 2 khi đợt 1 xong — dao động ±1 ở mỗi lần đổi pha.
 */
export function wavesDone(snap: Pick<BattleSnapshot, 'phase' | 'waveNumber' | 'waveCount'>): number {
  if (snap.phase === 'won') return snap.waveCount;
  return Math.max(0, snap.waveNumber - 1);
}

/** Phần trăm cho thanh tiến độ, đã kẹp trong [0, 100]. */
export function wavePercent(
  snap: Pick<BattleSnapshot, 'phase' | 'waveNumber' | 'waveCount'>,
): number {
  if (snap.waveCount <= 0) return 0;
  return Math.max(0, Math.min(100, (wavesDone(snap) / snap.waveCount) * 100));
}
