import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';

/** Chỉ CON SỐ đợt. Tách khỏi thanh tiến độ để bố cục dọc xếp được thành hai dòng. */
export function WaveNumber({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  return (
    <span className="disp num whitespace-nowrap text-[length:var(--text-lg)] font-bold leading-none">
      {t('battle.wave')} {snap.waveNumber}
      <span className="text-[length:var(--text-sm)] font-semibold text-dim"> / {snap.waveCount}</span>
    </span>
  );
}
