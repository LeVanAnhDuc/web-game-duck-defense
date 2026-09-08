/**
 * Kiểu và hằng của lõi mô phỏng.
 *
 * File này — và mọi file khác trong `core/` — KHÔNG được import Phaser, React,
 * `window`, `document`, `localStorage`, và không được gọi `Math.random`.
 * Xem `docs/03-design/architecture.md` §3 và ADR-0003.
 */

/** Số tick mô phỏng mỗi giây. Không bao giờ đổi theo tốc độ vẽ. */
export const TICKS_PER_SECOND = 60;

/**
 * Bước thời gian cố định của một tick, tính bằng giây.
 * Mô phỏng KHÔNG BAO GIỜ nhận `delta` thật của frame — tốc độ x2/x3 là chạy
 * nhiều tick hơn mỗi frame, không phải nhân `dt`. Xem `invariants.md` #4.
 */
export const FIXED_DT = 1 / TICKS_PER_SECOND;
