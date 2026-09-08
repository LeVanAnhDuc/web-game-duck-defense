/**
 * Đọc token màu từ CSS variable rồi đổi sang số nguyên cho Phaser.
 *
 * `MASTER.md` §8 cấm hardcode hex trong code Phaser: `src/tailwind.css` là bản
 * sao DUY NHẤT của bảng màu trong code, và đây là đường duy nhất từ đó vào canvas.
 * Bảng thứ hai sẽ lệch, và lệch âm thầm.
 *
 * Cỏ, đường và enemy giờ do sprite Kenney lo, nên chúng KHÔNG còn ở đây. Giá
 * trị duy nhất còn lại là màu vòng băng — nó là hiệu ứng vẽ bằng vector chồng
 * lên sprite, không phải một ô art. Chỉ mục frame và màu lấy mẫu từ pack nằm ở
 * `src/game/sprites.ts`.
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

    /** Vòng băng quanh enemy đang bị làm chậm. Hiệu ứng vector, không phải art. */
    frostBarrel: 0x7fd4e8,
  };
}
