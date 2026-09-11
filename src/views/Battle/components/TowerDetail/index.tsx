import type { TowerTypeId } from '@/data/towers';
import type { Translate } from '@/hooks/useLocale';
import { towerNameKey, towerDescKey } from '@/lib/towerStrings';

export function TowerDetail({
  towerId, t,
}: { towerId: TowerTypeId | null; t: Translate }) {
  if (!towerId) {
    return (
      <p className="rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3 text-[length:var(--text-sm)] leading-relaxed text-dim">
        {t('battle.tapSlotToBuild')}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3">
      <span className="disp text-[length:var(--text-md)] font-bold">{t(towerNameKey(towerId))}</span>
      <span className="text-[length:var(--text-sm)] leading-relaxed text-dim">{t(towerDescKey(towerId))}</span>
    </div>
  );
}

/* ── panel tháp đã chọn ───────────────────────────────────────────────────── */
