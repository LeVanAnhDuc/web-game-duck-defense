/**
 * Trao `cores` sau một trận (FR-16).
 *
 * Chơi lại bản đồ đã thắng vẫn ra `cores` nhưng ÍT HƠN HẲN. Nếu cày bản đồ dễ
 * hiệu quả hơn thử bản đồ khó thì cây nâng cấp đã hỏng — xem US-02 §Điều gì có
 * thể sai. Cày là lối thoát khi bí, không phải chiến lược tối ưu.
 */

export const CORES_PER_WAVE = 8;
export const FIRST_CLEAR_BONUS = 120;
/** Chơi lại bản đồ đã thắng chỉ còn 35%, và không có thưởng lần đầu. */
export const REPLAY_FACTOR = 0.35;

export function coresAward(
  wavesSurvived: number,
  won: boolean,
  alreadyCleared: boolean,
): number {
  const base = wavesSurvived * CORES_PER_WAVE;
  if (alreadyCleared) return Math.floor(base * REPLAY_FACTOR);
  return base + (won ? FIRST_CLEAR_BONUS : 0);
}
