import type { Translate } from '@/hooks/useLocale';
import { Press } from '@/components/Press';
import { IconLock } from '@/components/Icon';

export function StorageNotice({
  message, onDismiss, t,
}: { message: string; onDismiss: () => void; t: Translate }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b-2 border-edge bg-sunken px-4 py-3 text-[length:var(--text-sm)] leading-relaxed text-ink"
    >
      <span className="text-danger" aria-hidden><IconLock size={18} /></span>
      <p className="flex-1">{message}</p>
      <Press variant="raised" onClick={onDismiss} className="px-3 text-[length:var(--text-sm)]">
        {t('common.close')}
      </Press>
    </div>
  );
}

/* ── nhãn cho screen reader ───────────────────────────────────────────────── */

/**
 * NFR-A11Y-07 — canvas không tự nói được nó đang diễn ra chuyện gì. Vùng này
 * đọc tình hình trận thành chữ, cập nhật cùng nhịp snapshot (10Hz) nhưng
 * `aria-live="polite"` nên screen reader không cắt lời người dùng.
 */
