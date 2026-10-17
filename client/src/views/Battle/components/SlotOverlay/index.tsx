import { useEffect, useRef, useState } from 'react';
import type { BattleSnapshot } from '@/bridge';
import { MAPS, type MapId } from '@/data/maps';
import type { Translate } from '@/hooks/useLocale';

/**
 * Lớp nút DOM trong suốt nằm chồng lên các ô của canvas.
 *
 * Lý do nó tồn tại: **canvas không nhận được focus.** Không có lớp này thì Tab
 * không tới được ô nào, không có vòng focus nào hiện ra, và đặt tháp trở thành
 * việc chỉ làm được bằng chuột hoặc ngón tay — vi phạm NFR-A11Y-02.
 *
 * Canvas là 400×400 đơn vị, `Scale.FIT` + `CENTER_BOTH`, nên vị trí hiển thị
 * của một ô = tâm ô × tỉ lệ + lề. Tỉ lệ tính lại khi khung đổi kích thước, kể
 * cả khi xoay máy.
 */

const LOGICAL = 400;

type Props = {
  mapId: MapId;
  snap: BattleSnapshot;
  t: Translate;
  onPickSlot: (slotIndex: number) => void;
};

export function SlotOverlay({ mapId, snap, t, onPickSlot }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ scale: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      const scale = Math.min(width / LOGICAL, height / LOGICAL);
      setBox({
        scale,
        offsetX: (width - LOGICAL * scale) / 2,
        offsetY: (height - LOGICAL * scale) / 2,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const slots = MAPS[mapId].slots;
  const selectedIndex =
    snap.selection?.kind === 'slot' ? snap.selection.slotIndex
    : snap.selection?.kind === 'tower' ? snap.selection.slotIndex
    : -1;
  const occupied = new Set(snap.occupiedSlots);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0">
      {box.scale > 0 &&
        slots.map((slot, index) => {
          // Vùng bấm luôn ≥ 44px thật trên màn hình, kể cả khi canvas bị co nhỏ:
          // ô vẽ 36 đơn vị nên ở tỉ lệ nhỏ nó sẽ dưới ngưỡng NFR-A11Y-03.
          const drawn = 36 * box.scale;
          const size = Math.max(44, drawn);
          const left = box.offsetX + slot.x * box.scale - size / 2;
          const top = box.offsetY + slot.y * box.scale - size / 2;
          // Nhãn đúng cho MỌI ô, không chỉ ô đang chọn: ô đã xây mà vẫn đọc là
          // "Ô số N" thì người dùng screen reader không biết ô nào còn trống.
          // Chi tiết tháp (loại, bậc) chỉ có trong snapshot cho ô ĐANG chọn,
          // nên ô đã xây khác được đọc là "đã xây" — đủ để phân biệt.
          const isSelectedTower =
            snap.selection?.kind === 'tower' && snap.selection.slotIndex === index;
          const label = isSelectedTower && snap.selection?.kind === 'tower'
            ? t('battle.towerLabel', {
                tower: t(`tower.${snap.selection.typeId}` as never),
                level: snap.selection.level,
                n: index + 1,
              })
            : occupied.has(index)
              ? t('battle.slotBuilt', { n: index + 1 })
              : t('battle.slotLabel', { n: index + 1 });

          return (
            <button
              key={index}
              type="button"
              onClick={() => onPickSlot(index)}
              aria-pressed={selectedIndex === index}
              aria-label={label}
              className="pointer-events-auto absolute cursor-pointer rounded-[var(--radius-md)] focus-visible:outline-3 focus-visible:outline-act focus-visible:outline-offset-2"
              style={{ left, top, width: size, height: size }}
            />
          );
        })}
    </div>
  );
}
