import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { enemyNameKey } from '@/lib/towerStrings';

export function NextWaveStrip({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  if (snap.nextWave.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[length:var(--text-sm)] text-dim">{t('battle.nextWave')}</span>
      {snap.nextWave.map((entry) => (
        <span
          key={entry.enemyId}
          className="num rounded-[var(--radius-sm)] border border-edge bg-sunken px-2 py-0.5 text-[length:var(--text-sm)] font-medium"
        >
          {entry.count}× {t(enemyNameKey(entry.enemyId))}
        </span>
      ))}
    </div>
  );
}
