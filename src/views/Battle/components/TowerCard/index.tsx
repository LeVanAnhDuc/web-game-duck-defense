import type { TowerTypeId } from '@/data/towers';
import type { Translate } from '@/hooks/useLocale';
import { Press } from '@/components/Press';
import { IconCoin, IconLock } from '@/components/Icon';
import { TOWER_ICON } from '@/lib/towerIcon';
import { towerNameKey } from '@/lib/towerStrings';

/**
 * Thẻ chọn loại tháp.
 *
 * `affordable` chỉ nói về TIỀN, không nói về việc đã chọn ô chưa. Bản đầu gộp
 * hai thứ đó lại và thẻ hiện icon khoá khi người chơi đang có 260 vàng mà tháp
 * chỉ 60 — nó nói sai lý do. Hai trạng thái, hai cách hiện:
 *
 *   • không đủ tiền  → nền `--sunken`, chữ `--ui-dim`, icon KHOÁ, vô hiệu hoá
 *   • đủ tiền        → nền `--raised`, chữ sáng, icon XU
 *
 * Chưa chọn ô thì thẻ vẫn bấm được: nó chọn TRƯỚC loại tháp, rồi chạm ô sau —
 * đúng thứ tự mà phím tắt `1 2 3` đã làm.
 *
 * Không dùng `opacity` cho trạng thái tắt: nó kéo tương phản xuống dưới sàn mà
 * mọi hex trong code vẫn đúng (MASTER.md §1.1b). Và trạng thái luôn có kênh thứ
 * hai ngoài màu — icon khoá vs icon xu (NFR-A11Y-06).
 */
export function TowerCard({
  towerId, cost, affordable, selected, t, onPick,
}: {
  towerId: TowerTypeId; cost: number; affordable: boolean; selected: boolean;
  t: Translate; onPick: () => void;
}) {
  const Glyph = TOWER_ICON[towerId];
  return (
    <Press
      variant={affordable ? 'raised' : 'sunken'}
      disabled={!affordable}
      onClick={onPick}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1.5 px-2 py-2.5 ${selected ? 'outline-3 outline-offset-2 outline-act' : ''}`}
    >
      <span className={affordable ? 'text-ink' : 'text-dim'} aria-hidden>
        <Glyph size={26} />
      </span>
      <span className={`disp text-[length:var(--text-md)] font-bold ${affordable ? 'text-ink' : 'text-dim'}`}>
        {t(towerNameKey(towerId))}
      </span>
      <span className="flex items-center gap-1">
        <span className={affordable ? 'text-gold' : 'text-dim'} aria-hidden>
          {affordable ? <IconCoin size={16} /> : <IconLock size={16} />}
        </span>
        <span className={`disp num text-[length:var(--text-md)] font-bold ${affordable ? 'text-gold' : 'text-dim'}`}>
          {cost}
        </span>
      </span>
    </Press>
  );
}
