import { useCallback, useEffect, useRef, useState } from 'react';
import { pushIntent, resetBridge, type BattleSpeed } from '../../bridge';
import type { BattleOutcome } from '../../core/runBattle';
import type { UpgradeState } from '../../core/upgrades';
import type { MapId } from '../../data/maps';
import { STARTER_TOWER_IDS, type TowerTypeId } from '../../data/towers';
import { startGame, type GameHandle } from '../../game/boot';
import { Press } from '../components/Press';
import { IconBack } from '../components/Icon';
import { useLocale } from '../hooks/useLocale';
import { useLayoutMode } from '../hooks/useLayoutMode';
import { useSnapshot } from '../hooks/useSnapshot';
import { SlotOverlay } from '../battle/SlotOverlay';
import {
  BattleLiveRegion, CallWaveButton, GoldChip, LivesChip, NextWaveStrip,
  PauseButton, SelectedTowerPanel, SpeedControl, TowerCard, TowerDetail, WaveMeter,
} from '../battle/parts';

type Props = {
  mapId: MapId;
  upgrades: UpgradeState;
  onFinish: (outcome: BattleOutcome) => void;
  onQuit: () => void;
};

export function BattleScreen({ mapId, upgrades, onFinish, onQuit }: Props) {
  const { t } = useLocale();
  const mode = useLayoutMode();
  const snap = useSnapshot();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const [pickedTower, setPickedTower] = useState<TowerTypeId | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Seed sinh TRONG effect, không trong render: `Date.now()` là hàm không
    // thuần, và gọi nó lúc render cho ra giá trị khác mỗi lần React render lại.
    // Một lượt vào trận vì thế có đúng một seed, và trận đó tái tạo được.
    const seed = Date.now() & 0x7fffffff;

    resetBridge();
    const handle = startGame(host, { mapId, upgrades, seed, onFinish });
    handleRef.current = handle;

    return () => {
      handle.destroy();
      handleRef.current = null;
      resetBridge();
    };
    // `upgrades` và `onFinish` cố ý không nằm trong deps: đổi chúng giữa trận sẽ
    // dựng lại cả Phaser và mất trận đang chơi. Bậc nâng cấp được áp MỘT LẦN ở
    // `createBattle` (invariants #8) nên đổi giữa trận cũng không có nghĩa gì.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  const selection = snap?.selection ?? null;

  const pickSlot = useCallback((slotIndex: number) => {
    pushIntent({ kind: 'select', target: { kind: 'slot', slotIndex } });
  }, []);

  const build = useCallback(
    (towerId: TowerTypeId) => {
      if (selection?.kind !== 'slot') return;
      pushIntent({ kind: 'build', slotIndex: selection.slotIndex, towerId });
      setPickedTower(null);
    },
    [selection],
  );

  const upgrade = useCallback(() => {
    if (selection?.kind !== 'tower') return;
    pushIntent({ kind: 'upgrade', towerId: selection.towerId });
  }, [selection]);

  const sell = useCallback(() => {
    if (selection?.kind !== 'tower') return;
    pushIntent({ kind: 'sell', towerId: selection.towerId });
  }, [selection]);

  const callWave = useCallback(() => pushIntent({ kind: 'startWave' }), []);

  const setSpeed = useCallback((speed: BattleSpeed) => handleRef.current?.setSpeed(speed), []);
  const togglePause = useCallback(() => {
    if (!snap) return;
    handleRef.current?.setPaused(!snap.paused);
  }, [snap]);

  /* FR-29 — phím tắt. Mỗi phím là ĐƯỜNG TẮT cho việc đã làm được bằng cách khác
     (MASTER.md §5), không phải đường duy nhất. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === 'Escape') {
        pushIntent({ kind: 'select', target: null });
        setPickedTower(null);
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        callWave();
        return;
      }
      const index = ['1', '2', '3'].indexOf(event.key);
      if (index === -1) return;
      const towerId = STARTER_TOWER_IDS[index];
      if (!towerId) return;
      if (selection?.kind === 'slot') build(towerId);
      else setPickedTower(towerId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [build, callWave, selection]);

  const canvas = (
    <div className="relative min-h-0 flex-1 bg-letterbox">
      <div ref={hostRef} className="absolute inset-0" />
      {snap && <SlotOverlay mapId={mapId} snap={snap} t={t} onPickSlot={pickSlot} />}
    </div>
  );

  if (!snap) {
    return (
      <div className="flex h-full items-center justify-center bg-void">
        {canvas}
      </div>
    );
  }

  const buildPanel = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <h2 className="disp text-[length:var(--text-lg)] font-extrabold">{t('battle.buildTower')}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {snap.buildOptions.map((option) => (
          <TowerCard
            key={option.towerId}
            towerId={option.towerId}
            cost={option.cost}
            affordable={option.affordable && selection?.kind === 'slot'}
            selected={pickedTower === option.towerId}
            t={t}
            onPick={() => build(option.towerId)}
          />
        ))}
      </div>
      <TowerDetail towerId={pickedTower ?? snap.buildOptions[0]?.towerId ?? null} t={t} />
    </div>
  );

  const rightColumn = (
    <div className="flex w-[232px] flex-none flex-col gap-4 overflow-y-auto border-l-2 border-edge bg-panel p-4 lg:w-[352px]">
      {buildPanel}
      {selection?.kind === 'tower' && (
        <>
          <div className="h-0.5 bg-edge" />
          <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
        </>
      )}
      <p className="mt-auto rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3.5 text-[length:var(--text-sm)] leading-relaxed text-dim">
        {selection?.kind === 'tower' ? t('battle.rangeHint') : t('battle.keyHint')}
      </p>
    </div>
  );

  const backButton = (
    <Press onClick={onQuit} aria-label={t('common.back')} className="flex w-11 items-center justify-center">
      <IconBack size={20} />
    </Press>
  );

  /* ── wide: thanh HUD trên, canvas + cột phải, CTA dưới ─────────────────── */
  if (mode === 'wide') {
    return (
      <div className="flex h-full flex-col bg-void">
        <BattleLiveRegion snap={snap} t={t} />
        <header className="flex h-16 flex-none items-center gap-3.5 border-b-2 border-edge bg-panel px-5">
          {backButton}
          <PauseButton snap={snap} t={t} onToggle={togglePause} />
          <LivesChip snap={snap} t={t} />
          <GoldChip snap={snap} t={t} />
          <WaveMeter snap={snap} t={t} wide />
          <div className="ml-auto flex items-center gap-3.5">
            <SpeedControl snap={snap} t={t} onChange={setSpeed} />
            <div className="flex h-12 items-center rounded-[var(--radius-md)] border-2 border-edge px-3.5">
              <NextWaveStrip snap={snap} t={t} />
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          {canvas}
          {rightColumn}
        </div>
        <footer className="flex h-[76px] flex-none items-center justify-center border-t-2 border-edge bg-panel">
          <CallWaveButton snap={snap} t={t} onCall={callWave} className="w-[420px]" />
        </footer>
      </div>
    );
  }

  /* ── landscapeCompact: canvas giữa, HUD ở hai dải mép ──────────────────── */
  if (mode === 'landscapeCompact') {
    return (
      <div className="flex h-full bg-void">
        <BattleLiveRegion snap={snap} t={t} />
        <aside className="flex w-[136px] flex-none flex-col gap-2 border-r-2 border-edge bg-panel p-3">
          {backButton}
          <PauseButton snap={snap} t={t} onToggle={togglePause} />
          <LivesChip snap={snap} t={t} />
          <GoldChip snap={snap} t={t} />
          <div className="mt-auto">
            <WaveMeter snap={snap} t={t} />
          </div>
        </aside>
        {canvas}
        <aside className="flex w-[168px] flex-none flex-col gap-2.5 overflow-y-auto border-l-2 border-edge bg-panel p-3">
          <SpeedControl snap={snap} t={t} onChange={setSpeed} />
          <div className="grid grid-cols-3 gap-1.5">
            {snap.buildOptions.map((option) => (
              <TowerCard
                key={option.towerId}
                towerId={option.towerId}
                cost={option.cost}
                affordable={option.affordable && selection?.kind === 'slot'}
                selected={pickedTower === option.towerId}
                t={t}
                onPick={() => build(option.towerId)}
              />
            ))}
          </div>
          {selection?.kind === 'tower' && (
            <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
          )}
          <div className="mt-auto flex flex-col gap-2">
            <NextWaveStrip snap={snap} t={t} />
            <CallWaveButton snap={snap} t={t} onCall={callWave} short />
          </div>
        </aside>
      </div>
    );
  }

  /* ── portrait: HUD trên, canvas giữa, điều khiển đáy ───────────────────── */
  return (
    <div className="flex h-full flex-col bg-void">
      <BattleLiveRegion snap={snap} t={t} />
      <header className="flex-none border-b-2 border-edge bg-panel px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {backButton}
          <PauseButton snap={snap} t={t} onToggle={togglePause} />
          <LivesChip snap={snap} t={t} />
          <GoldChip snap={snap} t={t} />
          <div className="ml-auto">
            <WaveMeter snap={snap} t={t} />
          </div>
        </div>
      </header>

      {canvas}

      <footer className="flex flex-none flex-col gap-3 border-t-2 border-edge bg-panel px-3 pb-4 pt-3">
        {selection?.kind === 'tower' ? (
          <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
        ) : selection?.kind === 'slot' ? (
          buildPanel
        ) : (
          <NextWaveStrip snap={snap} t={t} />
        )}
        <div className="flex items-center gap-2.5">
          <SpeedControl snap={snap} t={t} onChange={setSpeed} />
          <span className="ml-auto text-[length:var(--text-sm)] text-dim">
            {selection ? '' : t('battle.tapSlotToBuild')}
          </span>
        </div>
        <CallWaveButton snap={snap} t={t} onCall={callWave} />
      </footer>
    </div>
  );
}
