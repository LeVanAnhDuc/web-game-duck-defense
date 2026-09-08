import type { RngState } from './types';

/**
 * RNG có seed — mulberry32.
 *
 * Nhỏ, nhanh, và đủ cho việc duy nhất nó phục vụ: dao động nhỏ khi sinh enemy.
 * Đây KHÔNG phải mật mã học và không cần phải là.
 *
 * Lý do tồn tại thay vì dùng `Math.random`: xem `invariants.md` #3. Không có
 * seed thì test cân bằng thành ngẫu nhiên đỏ-xanh, và một lỗi chỉ xuất hiện với
 * một chuỗi ngẫu nhiên cụ thể sẽ không bao giờ tái tạo được.
 */
export function makeRng(seed: number): RngState {
  return { seed: seed >>> 0 };
}

/** Trả về [0, 1). Thay đổi `rng.seed` tại chỗ. */
export function nextFloat(rng: RngState): number {
  rng.seed = (rng.seed + 0x6d2b79f5) >>> 0;
  let t = rng.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Trả về số nguyên trong [0, maxExclusive). */
export function nextInt(rng: RngState, maxExclusive: number): number {
  return Math.floor(nextFloat(rng) * maxExclusive);
}
