import type { BattleSnapshot, BattleSpeed } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Segmented } from '@/components/Segmented';

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
export function SpeedControl({
  snap, t, onChange, compact = false,
}: { snap: BattleSnapshot; t: Translate; onChange: (s: BattleSpeed) => void; compact?: boolean }) {
  return (
    <Segmented<'1' | '2' | '3'>
      ariaLabel={t('battle.speed')}
      value={String(snap.speed) as '1' | '2' | '3'}
      onChange={(v) => onChange(Number(v) as BattleSpeed)}
      options={[
        { value: '1', label: 'x1' },
        { value: '2', label: 'x2' },
        { value: '3', label: 'x3' },
      ]}
      className="flex-none"
      cellClassName={compact ? 'min-w-[44px] !text-[length:var(--text-sm)]' : 'min-w-[54px]'}
    />
  );
}
