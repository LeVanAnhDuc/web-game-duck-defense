import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { WaveNumber } from '../WaveNumber';
import { WaveBar } from '../WaveBar';

/**
 * Số đợt + thanh tiến độ xếp dọc.
 *
 * `min-w` chỉ đặt ở bố cục `wide`. Dải mép của bố cục ngang chỉ rộng 136px, nên
 * một `min-w-[140px]` ở đó sẽ đẩy nội dung tràn ra ngoài dải.
 */
export function WaveMeter({ snap, t, wide = false }: { snap: BattleSnapshot; t: Translate; wide?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${wide ? 'min-w-[190px]' : 'w-full'}`}>
      <WaveNumber snap={snap} t={t} />
      <WaveBar snap={snap} t={t} />
    </div>
  );
}
