import type { ReactNode } from 'react';
import type { BattleSnapshot, BattleSpeed } from '../../bridge';
import type { TowerTypeId } from '../../data/towers';
import type { StringKey } from '../../i18n';
import { Chip } from '../components/Chip';
import { Press } from '../components/Press';
import { Segmented } from '../components/Segmented';
import {
  IconArrow, IconBolt, IconBomb, IconCoin, IconDrop, IconHeart,
  IconLock, IconPause, IconPlay, IconSnow,
} from '../components/Icon';
import type { Translate } from '../hooks/useLocale';

export const TOWER_ICON: Record<TowerTypeId, (p: { size?: number }) => ReactNode> = {
  arrow: IconArrow,
  cannon: IconBomb,
  frost: IconSnow,
  bolt: IconBolt,
  venom: IconDrop,
};

const towerNameKey = (id: TowerTypeId): StringKey => `tower.${id}` as StringKey;
const towerDescKey = (id: TowerTypeId): StringKey => `tower.${id}.desc` as StringKey;
const enemyNameKey = (id: string): StringKey => `enemy.${id}` as StringKey;

/* ── HUD ──────────────────────────────────────────────────────────────────── */

export function LivesChip({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  return (
    <Chip
      icon={<IconHeart size={18} />}
      iconClassName="text-danger"
      value={snap.lives}
      label={`${t('common.lives')}: ${snap.lives}`}
    />
  );
}

export function GoldChip({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  return (
    <Chip
      icon={<IconCoin size={18} />}
      iconClassName="text-gold"
      value={snap.gold}
      label={`${t('common.gold')}: ${snap.gold}`}
    />
  );
}

export function WaveMeter({ snap, t, wide = false }: { snap: BattleSnapshot; t: Translate; wide?: boolean }) {
  const done = snap.waveNumber - (snap.phase === 'wave' ? 1 : 0);
  const pct = Math.max(0, Math.min(100, (done / snap.waveCount) * 100));
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? 'min-w-[190px]' : 'min-w-[140px]'}`}>
      <span className="disp num text-[length:var(--text-lg)] font-bold leading-none">
        {t('battle.wave')} {snap.waveNumber}
        <span className="text-[length:var(--text-sm)] font-semibold text-dim"> / {snap.waveCount}</span>
      </span>
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
    </div>
  );
}

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

export function SpeedControl({
  snap, t, onChange, cellWidth,
}: { snap: BattleSnapshot; t: Translate; onChange: (s: BattleSpeed) => void; cellWidth?: number }) {
  return (
    <Segmented<'1' | '2' | '3'>
      ariaLabel={t('battle.wave')}
      value={String(snap.speed) as '1' | '2' | '3'}
      onChange={(v) => onChange(Number(v) as BattleSpeed)}
      options={[
        { value: '1', label: 'x1' },
        { value: '2', label: 'x2' },
        { value: '3', label: 'x3' },
      ]}
      cellClassName={cellWidth ? `!flex-none` : ''}
      className={cellWidth ? '' : 'flex-none'}
    />
  );
}

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

export function CallWaveButton({
  snap, t, onCall, short = false, className = '',
}: { snap: BattleSnapshot; t: Translate; onCall: () => void; short?: boolean; className?: string }) {
  const enabled = snap.phase === 'prep';
  return (
    <Press
      variant="primary"
      disabled={!enabled}
      onClick={onCall}
      className={`disp flex items-center justify-center gap-2.5 text-[length:var(--text-lg)] font-extrabold ${className}`}
    >
      <IconPlay size={18} />
      {short ? t('battle.callWaveShort') : t('battle.callWave')}
    </Press>
  );
}

/* ── panel xây tháp ───────────────────────────────────────────────────────── */

export function TowerCard({
  towerId, cost, affordable, selected, t, onPick,
}: {
  towerId: TowerTypeId; cost: number; affordable: boolean; selected: boolean;
  t: Translate; onPick: () => void;
}) {
  const Glyph = TOWER_ICON[towerId];
  // Trạng thái "không đủ tiền" đổi TOKEN NỀN + TOKEN CHỮ, không dùng opacity —
  // MASTER.md §1.1b. Và nó kèm icon khoá, không chỉ đổi màu — NFR-A11Y-06.
  return (
    <Press
      variant={affordable ? 'raised' : 'sunken'}
      disabled={!affordable}
      onClick={onPick}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1.5 px-2 py-2.5 ${selected ? 'outline-3 outline-offset-2 outline-act' : ''}`}
    >
      <span className={affordable ? 'text-ink' : 'text-dim'} aria-hidden>
        <Glyph size={26} />
      </span>
      <span className={`disp text-[length:var(--text-md)] font-bold ${affordable ? 'text-ink' : 'text-dim'}`}>
        {t(towerNameKey(towerId))}
      </span>
      <span className="flex items-center gap-1">
        <span className={affordable ? 'text-gold' : 'text-dim'} aria-hidden>
          {affordable ? <IconCoin size={16} /> : <IconLock size={16} />}
        </span>
        <span className={`disp num text-[length:var(--text-md)] font-bold ${affordable ? 'text-gold' : 'text-dim'}`}>
          {cost}
        </span>
      </span>
    </Press>
  );
}

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

export function StorageNotice({
  message, onDismiss, t,
}: { message: string; onDismiss: () => void; t: Translate }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b-2 border-edge bg-sunken px-4 py-3 text-[length:var(--text-sm)] leading-relaxed text-ink"
    >
      <span className="text-danger" aria-hidden><IconLock size={18} /></span>
      <p className="flex-1">{message}</p>
      <Press variant="raised" onClick={onDismiss} className="px-3 text-[length:var(--text-sm)]">
        {t('common.close')}
      </Press>
    </div>
  );
}

/* ── nhãn cho screen reader ───────────────────────────────────────────────── */

/**
 * NFR-A11Y-07 — canvas không tự nói được nó đang diễn ra chuyện gì. Vùng này
 * đọc tình hình trận thành chữ, cập nhật cùng nhịp snapshot (10Hz) nhưng
 * `aria-live="polite"` nên screen reader không cắt lời người dùng.
 */
export function BattleLiveRegion({ snap, t }: { snap: BattleSnapshot; t: Translate }) {
  return (
    <p aria-live="polite" className="sr-only">
      {t('battle.wave')} {snap.waveNumber}/{snap.waveCount} · {t('common.lives')} {snap.lives} · {t('common.gold')} {snap.gold}
    </p>
  );
}
