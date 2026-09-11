import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Press } from '@/components/Press';
import { IconPlay } from '@/components/Icon';

export function CallWaveButton({
  snap, t, onCall, short = false, className = '',
}: { snap: BattleSnapshot; t: Translate; onCall: () => void; short?: boolean; className?: string }) {
  const enabled = snap.phase === 'prep';
  return (
    <Press
      variant="primary"
      disabled={!enabled}
      onClick={onCall}
      className={[
        'disp flex items-center justify-center gap-2 px-2 font-extrabold',
        short ? 'text-[length:var(--text-md)]' : 'text-[length:var(--text-lg)] gap-2.5',
        className,
      ].join(' ')}
    >
      <IconPlay size={short ? 16 : 18} />
      <span className="truncate">{short ? t('battle.callWaveShort') : t('battle.callWave')}</span>
    </Press>
  );
}

/* ── panel xây tháp ───────────────────────────────────────────────────────── */

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
