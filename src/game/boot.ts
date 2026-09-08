import Phaser from 'phaser';
import type { BattleSpeed, Selection } from '../bridge';
import { BattleScene, type BattleSceneConfig } from './BattleScene';

export type GameHandle = {
  destroy: () => void;
  setSpeed: (speed: BattleSpeed) => void;
  setPaused: (paused: boolean) => void;
  setSelection: (selection: Selection) => void;
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

  /**
   * `Scale.FIT` của Phaser chỉ nghe `window.resize`. Khung chứa ở đây đổi kích
   * thước vì CSS grid đổi, mà cửa sổ không đổi — nên phải tự quan sát.
   */
  const observer = new ResizeObserver(() => game.scale.refresh());
  observer.observe(parent);

  return {
    destroy: () => {
      observer.disconnect();
      game.destroy(true);
    },
    setSpeed: (speed) => scene.setSpeed(speed),
    setPaused: (paused) => scene.setPaused(paused),
    setSelection: (selection) => scene.setSelection(selection),
    refreshScale: () => game.scale.refresh(),
  };
}
