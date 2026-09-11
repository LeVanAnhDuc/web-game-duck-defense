import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Press } from '@/components/Press';
import { IconPause, IconPlay } from '@/components/Icon';

export function PauseButton({
  snap, t, onToggle,
}: { snap: BattleSnapshot; t: Translate; onToggle: () => void }) {
  return (
    <Press
      onClick={onToggle}
      aria-pressed={snap.paused}
      aria-label={snap.paused ? t('battle.resume') : t('battle.pause')}
      className="flex w-12 items-center justify-center"
    >
      {snap.paused ? <IconPlay size={20} /> : <IconPause size={20} />}
    </Press>
  );
}

/**
 * Chọn tốc độ trận.
 *
 * `min-w` trên từng ô là bắt buộc: ô dùng `flex-1`, và khi cả nhóm nằm trong
 * một hàng flex không đặt bề rộng thì nó co về min-content — "x1" rộng ~16px,
 * ba ô dồn lại thành một cục chữ đè lên nhau.
 *
 * `compact` cho dải mép của bố cục ngang: dải đó rộng 168px, trừ padding còn
 * 144px, nên 3×54 + viền = 166px sẽ đẩy tràn cả cột và kéo theo nút "gọi đợt"
 * ra khỏi mép. 3×44 + viền = 136px thì vừa, và vẫn đúng sàn 44px của
 * NFR-A11Y-03 theo chiều cao.
 */
