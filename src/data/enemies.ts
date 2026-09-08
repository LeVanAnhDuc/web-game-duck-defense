/**
 * Số liệu enemy. SỐ, không logic — `architecture.md` §3.
 *
 * Đây là phỏng đoán đầu tiên, chưa qua một lượt chơi thật nào; xem
 * `backlog.md` §Nợ kỹ thuật. Cái sai NGHIÊM TRỌNG (bản đồ bất khả thi) bị
 * `tests/balance/maps-are-beatable.test.ts` chặn; cái "chưa vui" thì phải chơi
 * mới biết.
 */

export type EnemyTypeId = 'grunt' | 'armored' | 'runner';

export type EnemyType = {
  id: EnemyTypeId;
  hp: number;
  /** Đơn vị bản đồ mỗi giây. Bản đồ rộng 400 đơn vị. */
  speed: number;
  /** Giảm sát thương phẳng. Sát thương thực có sàn 1 — xem `design.md` §2. */
  armor: number;
  /** Vàng nhận được khi giết. */
  bounty: number;
  /** Số mạng bị trừ nếu tới cuối đường. */
  leak: number;
};

export const ENEMIES: Record<EnemyTypeId, EnemyType> = {
  grunt: { id: 'grunt', hp: 60, speed: 34, armor: 0, bounty: 6, leak: 1 },
  runner: { id: 'runner', hp: 34, speed: 62, armor: 0, bounty: 7, leak: 1 },
  armored: { id: 'armored', hp: 150, speed: 26, armor: 6, bounty: 14, leak: 2 },
};

export const ENEMY_IDS = Object.keys(ENEMIES) as EnemyTypeId[];
