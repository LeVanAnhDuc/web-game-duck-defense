import type { ReactNode } from 'react';
import type { TowerTypeId } from '@/data/towers';
import { IconArrow, IconBolt, IconBomb, IconDrop, IconSnow } from '@/components/Icon';

export const TOWER_ICON: Record<TowerTypeId, (p: { size?: number }) => ReactNode> = {
  arrow: IconArrow,
  cannon: IconBomb,
  frost: IconSnow,
  bolt: IconBolt,
  venom: IconDrop,
};

/* ── HUD ──────────────────────────────────────────────────────────────────── */
