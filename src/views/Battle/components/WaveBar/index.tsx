import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { wavePercent, wavesDone } from '@/lib/waveProgress';

export function WaveBar({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  const done = wavesDone(snap);
  const pct = wavePercent(snap);
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-sunken"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={snap.waveCount}
      aria-valuenow={done}
      aria-label={t('battle.wave')}
    >
      <div className="h-full bg-act" style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * Số đợt + thanh tiến độ xếp dọc.
 *
 * `min-w` chỉ đặt ở bố cục `wide`. Dải mép của bố cục ngang chỉ rộng 136px, nên
 * một `min-w-[140px]` ở đó sẽ đẩy nội dung tràn ra ngoài dải.
 */
