import Phaser from 'phaser';
import type { BattleSpeed } from '../bridge';
import { BattleScene, type BattleSceneConfig } from './BattleScene';

export type GameHandle = {
  destroy: () => void;
  setSpeed: (speed: BattleSpeed) => void;
  setPaused: (paused: boolean) => void;
  /**
   * Bảo Phaser đo lại khung chứa.
   *
   * Cần thiết vì bố cục đổi bằng CSS grid, không bằng resize cửa sổ — và
   * `Scale.FIT` chỉ tự đo lại khi window resize. Thiếu lời gọi này thì canvas
   * giữ nguyên kích thước của bố cục trước.
   */
  refreshScale: () => void;
};

/**
 * Khởi động Phaser trong một phần tử DOM và trả về tay cầm để tắt.
 *
 * Kích thước logic cố định 400×400 — đúng đơn vị bản đồ trong `data/`, nên mọi
 * phép vẽ dùng thẳng toạ độ bản đồ, không quy đổi. `Scale.FIT` + `CENTER_BOTH`
 * lo phần co giãn, kể cả khi xoay máy (US-01: xoay giữa trận KHÔNG reset trận,
 * vì `BattleState` không biết gì về kích thước màn hình).
 */
export function startGame(parent: HTMLElement, cfg: BattleSceneConfig): GameHandle {
  const scene = new BattleScene(cfg);

  const letterbox = getComputedStyle(document.documentElement)
    .getPropertyValue('--letterbox')
    .trim() || '#0A141B';

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 400,
    height: 400,
    backgroundColor: letterbox,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, powerPreference: 'low-power' },
    audio: { noAudio: true },
    banner: false,
    scene,
  });

  /** `game.scale` đã destroy thì gọi vào là ném lỗi, mà `ResizeObserver` còn
   * bắn được một nhịp khi khung chứa bị tháo — nên phải có cờ này. */
  let alive = true;

  /**
   * Hai lời gọi, không phải một — và đây là chỗ dễ sai nhất ở file này.
   *
   * `refresh()` tính lại tỉ lệ từ `parentSize` mà Phaser đã cache, nó KHÔNG
   * đọc lại DOM; `getParentBounds()` mới là hàm đọc lại. Thiếu nó thì mọi lần
   * refresh chỉ lặp lại số đo cũ, kể cả khi khung chứa đã đổi từ lâu.
   */
  const refresh = () => {
    if (!alive) return;
    game.scale.getParentBounds();
    game.scale.refresh();
  };

  /**
   * `Scale.FIT` của Phaser chỉ nghe `window.resize`. Khung chứa ở đây đổi kích
   * thước vì CSS grid đổi, mà cửa sổ không đổi — nên phải tự quan sát.
   *
   * Quan sát viên này là ĐỦ, không cần thêm một lần đo lúc game ready: canvas
   * chỉ sai khi khung chứa đổi kích thước SAU lúc Phaser boot, mà mỗi lần đổi
   * như vậy đều bắn `ResizeObserver`. Đã kiểm bằng cách bỏ lần đo ở `ready` —
   * test hồi quy vẫn xanh.
   */
  const observer = new ResizeObserver(refresh);
  observer.observe(parent);

  return {
    destroy: () => {
      alive = false;
      observer.disconnect();
      game.destroy(true);
    },
    setSpeed: (speed) => scene.setSpeed(speed),
    setPaused: (paused) => scene.setPaused(paused),
    refreshScale: refresh,
  };
}
