import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Chip } from '@/components/Chip';
import { IconHeart } from '@/components/Icon';

export function LivesChip({
  snap, t, size = 'md',
}: { snap: BattleSnapshot; t: Translate; size?: 'md' | 'sm' }) {
  return (
    <Chip
      icon={<IconHeart size={18} />}
      iconClassName="text-danger"
      value={snap.lives}
      label={`${t('common.lives')}: ${snap.lives}`}
      size={size}
    />
  );
}
