import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Chip } from '@/components/Chip';
import { IconCoin } from '@/components/Icon';

export function GoldChip({
  snap, t, size = 'md',
}: { snap: BattleSnapshot; t: Translate; size?: 'md' | 'sm' }) {
  return (
    <Chip
      icon={<IconCoin size={18} />}
      iconClassName="text-gold"
      value={snap.gold}
      label={`${t('common.gold')}: ${snap.gold}`}
      size={size}
    />
  );
}

/** Chỉ CON SỐ đợt. Tách khỏi thanh tiến độ để bố cục dọc xếp được thành hai dòng. */
