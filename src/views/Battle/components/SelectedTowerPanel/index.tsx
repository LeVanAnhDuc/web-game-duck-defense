import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { Press } from '@/components/Press';
import { IconCoin } from '@/components/Icon';
import { TOWER_ICON } from '@/lib/towerIcon';
import { towerNameKey } from '@/lib/towerStrings';

export function SelectedTowerPanel({
  snap, t, onUpgrade, onSell,
}: { snap: BattleSnapshot; t: Translate; onUpgrade: () => void; onSell: () => void }) {
  const sel = snap.selection;
  if (!sel || sel.kind !== 'tower') return null;
  const Glyph = TOWER_ICON[sel.typeId];
  const canUpgrade = sel.upgradeCost !== null && snap.gold >= sel.upgradeCost;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border-2 border-edge bg-raised text-ink" aria-hidden>
          <Glyph size={24} />
        </span>
        <div>
          <p className="disp text-[length:var(--text-xl2)] font-extrabold leading-tight">
            {t(towerNameKey(sel.typeId))} · {t('tower.level', { level: sel.level })}
          </p>
          <p className="text-[length:var(--text-sm)] text-dim">
            {t('tower.levelOf', { level: sel.level, max: sel.maxLevel })}
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-1.5">
        <div className="flex text-[length:var(--text-md)]">
          <dt className="text-dim">{t('tower.damage')}</dt>
          <dd className="disp num ml-auto font-bold">
            {sel.damage}
            {sel.nextDamage !== null && <span className="text-ok"> → {sel.nextDamage}</span>}
          </dd>
        </div>
      </dl>

      <div className="flex gap-2.5">
        {sel.upgradeCost === null ? (
          <p className="flex-1 rounded-[var(--radius-md)] border-2 border-edge bg-sunken px-3 py-3 text-center text-[length:var(--text-md)] font-semibold text-dim">
            {t('tower.maxLevel')}
          </p>
        ) : (
          <Press
            variant="primary"
            disabled={!canUpgrade}
            onClick={onUpgrade}
            className="disp flex flex-1 items-center justify-center gap-2 text-[length:var(--text-md)] font-extrabold"
          >
            {t('tower.upgrade')}
            <IconCoin size={17} />
            <span className="num">{sel.upgradeCost}</span>
          </Press>
        )}
        {/* Nền --sunken, không --raised: --sem-gold trên --raised đạt 5.86 nhưng
            nút này còn có chữ dim khi disabled — MASTER.md §1.1b. */}
        <Press
          variant="sunken"
          onClick={onSell}
          className="disp flex items-center justify-center gap-2 px-4 text-[length:var(--text-md)] font-bold"
        >
          {t('tower.sell')}
          <span className="num text-gold">+{sel.sellValue}</span>
        </Press>
      </div>
    </div>
  );
}

/* ── thông báo lưu trữ ────────────────────────────────────────────────────── */
