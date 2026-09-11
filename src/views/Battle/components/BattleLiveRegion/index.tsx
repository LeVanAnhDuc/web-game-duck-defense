import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';

/**
 * NFR-A11Y-07 — canvas không tự nói được nó đang diễn ra chuyện gì. Vùng này
 * đọc tình hình trận thành chữ, cập nhật cùng nhịp snapshot (10Hz) nhưng
 * `aria-live="polite"` nên screen reader không cắt lời người dùng.
 */
export function BattleLiveRegion({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  return (
    <p aria-live="polite" className="sr-only">
      {t('battle.wave')} {snap.waveNumber}/{snap.waveCount} · {t('common.lives')} {snap.lives} · {t('common.gold')} {snap.gold}
    </p>
  );
}
