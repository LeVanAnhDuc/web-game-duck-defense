import { useEffect } from 'react';
import type { BattleSnapshot } from '@/bridge';
import { STARTER_TOWER_IDS, type TowerTypeId } from '@/data/towers';

/**
 * FR-29 — phím tắt của màn trận. Mỗi phím là ĐƯỜNG TẮT cho việc đã làm được
 * bằng cách khác (MASTER.md §5), không phải đường duy nhất.
 *
 * Ghost: chỉ chạy side-effect, không vẽ gì (R-04).
 */
export function BattleShortcuts({
  selection,
  onEscape,
  onCallWave,
  onChooseTower,
}: {
  selection: BattleSnapshot['selection'] | null;
  /** Esc: bỏ chọn cả ô trên bàn và loại tháp đang chọn trước. */
  onEscape: () => void;
  onCallWave: () => void;
  /** `slotSelected` = đang có ô được chọn, nên chạm số là XÂY chứ không phải chọn trước. */
  onChooseTower: (towerId: TowerTypeId, slotSelected: boolean) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      // Phím tắt KHÔNG được chiếm phím của phần tử đang focus. Space là chỗ dễ
      // sai nhất: `preventDefault` trên keydown chặn luôn cú click ngầm của một
      // <button>, nên người dùng bàn phím Tab tới "GỌI ĐỢT", "Nâng", "Bán" hay
      // một ô rồi bấm Space sẽ gọi đợt thay vì bấm chính cái nút đó — đúng thứ
      // NFR-A11Y-02 tồn tại để tránh.
      const onControl =
        target instanceof HTMLElement &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (target instanceof HTMLInputElement) return;

      if (event.key === 'Escape') {
        onEscape();
        return;
      }
      if (event.code === 'Space') {
        if (onControl) return; // để chính nút đó xử lý
        event.preventDefault();
        onCallWave();
        return;
      }
      const index = ['1', '2', '3'].indexOf(event.key);
      if (index === -1) return;
      const towerId = STARTER_TOWER_IDS[index];
      if (!towerId) return;
      onChooseTower(towerId, selection?.kind === 'slot');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection, onEscape, onCallWave, onChooseTower]);

  return null;
}
