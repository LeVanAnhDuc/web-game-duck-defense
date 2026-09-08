/**
 * Đọc token màu từ CSS variable rồi đổi sang số nguyên cho Phaser.
 *
 * `MASTER.md` §8 cấm hardcode hex trong code Phaser: `src/tailwind.css` là bản
 * sao DUY NHẤT của bảng màu trong code, và đây là đường duy nhất từ đó vào canvas.
 * Bảng thứ hai sẽ lệch, và lệch âm thầm.
 *
 * Bảy màu art (cỏ, đường, enemy) là TẠM, sẽ bị sprite Kenney thay — `MASTER.md`
 * §1.3. Chúng nằm ở đây chứ không trong CSS vì chúng chỉ tồn tại trong canvas.
 */

const readVar = (name: string): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  const parsed = Number.parseInt(hex, 16);
  if (Number.isNaN(parsed)) {
    throw new Error(`token màu ${name} không đọc được từ CSS (nhận "${raw}")`);
  }
  return parsed;
};

export type Palette = ReturnType<typeof readPalette>;

export function readPalette() {
  return {
    // từ MASTER.md, qua tailwind.css
    void: readVar('--ui-void'),
    panel: readVar('--ui-panel'),
    edge: readVar('--ui-edge'),
    ink: readVar('--ui-ink'),
    dim: readVar('--ui-dim'),
    act: readVar('--ui-act'),
    gold: readVar('--sem-gold'),
    core: readVar('--sem-core'),
    danger: readVar('--sem-danger'),
    ok: readVar('--sem-ok'),
    letterbox: readVar('--letterbox'),
    sunken: readVar('--sunken'),
    raised: readVar('--raised'),

    // TẠM — MASTER.md §1.3, xoá khi sprite Kenney vào
    grassA: 0x4e7b45,
    grassB: 0x55834b,
    pathEdge: 0x96743f,
    pathFill: 0xcba96d,
    enemyGrunt: 0xb4443f,
    enemyArmored: 0x8c6bb1,
    enemyRunner: 0xd98040,
    frostBarrel: 0x7fd4e8,
  };
}
