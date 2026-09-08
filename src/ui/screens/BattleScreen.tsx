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
import { useLayoutMode, type LayoutMode } from '../hooks/useLayoutMode';
import { useSnapshot } from '../hooks/useSnapshot';
import { SlotOverlay } from '../battle/SlotOverlay';
import {
  BattleLiveRegion, CallWaveButton, GoldChip, LivesChip, NextWaveStrip,
  PauseButton, SelectedTowerPanel, SpeedControl, TowerCard, TowerDetail,
  WaveBar, WaveMeter, WaveNumber,
} from '../battle/parts';

type Props = {
  mapId: MapId;
  upgrades: UpgradeState;
  onFinish: (outcome: BattleOutcome) => void;
  onQuit: () => void;
};

/**
 * Ba bố cục, MỘT lưới.
 *
 * Phaser append `<canvas>` vào một div bằng tay, nên div đó KHÔNG ĐƯỢC unmount.
 * Bản đầu dựng ba nhánh JSX riêng và đặt khung canvas ở vị trí khác nhau trong
 * mỗi nhánh; khi snapshot đầu tiên tới và component đổi nhánh, React unmount div
 * cũ và mang theo cả canvas. Màn hình trắng, không một dòng lỗi nào.
 *
 * Cách sửa: MỘT lưới CSS với bốn vùng đặt tên, thứ tự DOM cố định (`board` luôn
 * là con đầu tiên), và chỉ `grid-template-areas` đổi theo bố cục. Nội dung của
 * `top`/`bottom`/`side` vẫn được phép đổi — chỉ khung canvas là không.
 */
const GRID: Record<LayoutMode, string> = {
  portrait:
    '[grid-template-areas:"top"_"board"_"bottom"] grid-rows-[auto_minmax(0,1fr)_auto] grid-cols-[minmax(0,1fr)]',
  landscapeCompact:
    '[grid-template-areas:"top_board_bottom"] grid-rows-[minmax(0,1fr)] grid-cols-[136px_minmax(0,1fr)_168px]',
  wide:
    '[grid-template-areas:"top_top"_"board_side"_"bottom_bottom"] grid-rows-[auto_minmax(0,1fr)_auto] grid-cols-[minmax(0,1fr)_232px] lg:grid-cols-[minmax(0,1fr)_352px]',
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

  /* Đổi bố cục làm khung canvas đổi kích thước mà KHÔNG có sự kiện resize của
     window (lưới đổi, cửa sổ không đổi). Phaser chỉ nghe window resize, nên
     phải bảo nó đo lại — thiếu bước này canvas giữ kích thước của bố cục cũ. */
  useEffect(() => {
    handleRef.current?.refreshScale();
  }, [mode]);

  const selection = snap?.selection ?? null;

  const pickSlot = useCallback(
    (slotIndex: number) => {
      // Đã chọn trước loại tháp thì lần chạm ô này LÀ thao tác thứ hai: xây.
      if (pickedTower) {
        pushIntent({ kind: 'build', slotIndex, towerId: pickedTower });
        setPickedTower(null);
        return;
      }
      pushIntent({ kind: 'select', target: { kind: 'slot', slotIndex } });
    },
    [pickedTower],
  );

  /**
   * Chạm một thẻ tháp.
   *
   * Đã chọn ô thì XÂY ngay. Chưa chọn ô thì chỉ ghi nhớ loại tháp, và lần chạm
   * ô kế tiếp mới xây — cùng thứ tự với phím tắt `1 2 3`. Không có đường nào để
   * một lần chạm vừa chọn ô vừa xây (US-01: "chạm vào ô là chọn ô, không bao
   * giờ vô tình xây").
   */
  const build = useCallback(
    (towerId: TowerTypeId) => {
      if (selection?.kind !== 'slot') {
        setPickedTower((current) => (current === towerId ? null : towerId));
        return;
      }
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

  const towerRow = snap ? (
    // `data-testid` để e2e khoanh vùng truy vấn: nhãn của nút Ô trên overlay
    // cũng chứa tên tháp ("Pháo bậc 1 ở ô số 9"), nên tìm theo tên trên cả trang
    // là nhập nhằng. Khoanh vùng rẻ và rõ hơn là bịa một regex.
    <div data-testid="tower-cards" className="grid grid-cols-3 gap-2.5">
      {snap.buildOptions.map((option) => (
        <TowerCard
          key={option.towerId}
          towerId={option.towerId}
          cost={option.cost}
          affordable={option.affordable}
          selected={pickedTower === option.towerId}
          t={t}
          onPick={() => build(option.towerId)}
        />
      ))}
    </div>
  ) : null;

  const buildPanel = snap ? (
    <div className="flex flex-col gap-3">
      <h2 className="disp text-[length:var(--text-lg)] font-extrabold">{t('battle.buildTower')}</h2>
      {towerRow}
      <TowerDetail towerId={pickedTower ?? snap.buildOptions[0]?.towerId ?? null} t={t} />
    </div>
  ) : null;

  const backButton = (
    <Press onClick={onQuit} aria-label={t('common.back')} className="flex w-11 items-center justify-center">
      <IconBack size={20} />
    </Press>
  );

  return (
    <div className={`grid h-full bg-void ${GRID[mode]}`}>
      {/* `board` LUÔN là con đầu tiên và luôn là CÙNG một node — xem ghi chú
          trên `GRID`. Không được bọc nó trong bất kỳ nhánh điều kiện nào.

          `overflow-hidden` là hàng rào cứng, không phải trang trí: Phaser đo
          khung chứa lúc boot, và nếu lúc đó lưới chưa xếp xong nó lấy một kích
          thước lớn hơn thật. Canvas khi đó phủ xuống cả thanh đáy và CHẶN
          pointer lên nút "gọi đợt" — nút vẫn hiện, vẫn enabled, chỉ là không
          bấm được. Đúng loại lỗi mà chỉ e2e trên trình duyệt thật bắt được. */}
      <div className="relative min-h-0 min-w-0 overflow-hidden bg-letterbox [grid-area:board]">
        <div ref={hostRef} className="absolute inset-0" />
        {snap && <SlotOverlay mapId={mapId} snap={snap} t={t} onPickSlot={pickSlot} />}
      </div>

      {snap && <BattleLiveRegion snap={snap} t={t} />}

      {/* Thanh HUD dọc là HAI dòng, không phải một: ở 375px một dòng gồm back +
          pause + hai chip + số đợt cần ~449px và tràn ngang 26px. Mockup đã
          duyệt cũng hai dòng — thanh tiến độ chiếm trọn dòng dưới. */}
      {snap && mode === 'portrait' && (
        <header className="min-w-0 border-b-2 border-edge bg-panel px-3 py-2.5 [grid-area:top]">
          <div className="flex min-w-0 items-center gap-2">
            {backButton}
            <PauseButton snap={snap} t={t} onToggle={togglePause} />
            <LivesChip snap={snap} t={t} size="sm" />
            <GoldChip snap={snap} t={t} size="sm" />
            <span className="ml-auto">
              <WaveNumber snap={snap} t={t} />
            </span>
          </div>
          <div className="mt-2.5">
            <WaveBar snap={snap} t={t} />
          </div>
        </header>
      )}

      {snap && mode === 'portrait' && (
        <footer className="flex flex-col gap-3 border-t-2 border-edge bg-panel px-3 pb-4 pt-3 [grid-area:bottom]">
          {selection?.kind === 'tower' ? (
            <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
          ) : selection?.kind === 'slot' ? (
            buildPanel
          ) : (
            <NextWaveStrip snap={snap} t={t} />
          )}
          <div className="flex items-center gap-2.5">
            <SpeedControl snap={snap} t={t} onChange={setSpeed} />
            {!selection && (
              <span className="ml-auto text-[length:var(--text-sm)] text-dim">
                {t('battle.tapSlotToBuild')}
              </span>
            )}
          </div>
          <CallWaveButton snap={snap} t={t} onCall={callWave} />
        </footer>
      )}

      {snap && mode === 'landscapeCompact' && (
        <aside className="flex min-w-0 flex-col gap-2 overflow-y-auto border-r-2 border-edge bg-panel p-3 [grid-area:top]">
          {backButton}
          <PauseButton snap={snap} t={t} onToggle={togglePause} />
          <LivesChip snap={snap} t={t} />
          <GoldChip snap={snap} t={t} />
          <div className="mt-auto">
            <WaveMeter snap={snap} t={t} />
          </div>
        </aside>
      )}

      {snap && mode === 'landscapeCompact' && (
        <aside className="flex min-w-0 flex-col gap-2.5 overflow-y-auto border-l-2 border-edge bg-panel p-3 [grid-area:bottom]">
          <SpeedControl snap={snap} t={t} onChange={setSpeed} compact />
          {towerRow}
          {selection?.kind === 'tower' && (
            <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
          )}
          <div className="mt-auto flex flex-col gap-2">
            <NextWaveStrip snap={snap} t={t} />
            <CallWaveButton snap={snap} t={t} onCall={callWave} short />
          </div>
        </aside>
      )}

      {snap && mode === 'wide' && (
        <header className="flex h-16 items-center gap-3.5 border-b-2 border-edge bg-panel px-5 [grid-area:top]">
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
      )}

      {snap && mode === 'wide' && (
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l-2 border-edge bg-panel p-4 [grid-area:side]">
          {buildPanel}
          {selection?.kind === 'tower' && (
            <>
              <div className="h-0.5 flex-none bg-edge" />
              <SelectedTowerPanel snap={snap} t={t} onUpgrade={upgrade} onSell={sell} />
            </>
          )}
          <p className="mt-auto flex-none rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3.5 text-[length:var(--text-sm)] leading-relaxed text-dim">
            {selection?.kind === 'tower' ? t('battle.rangeHint') : t('battle.keyHint')}
          </p>
        </div>
      )}

      {snap && mode === 'wide' && (
        <footer className="flex h-[76px] items-center justify-center border-t-2 border-edge bg-panel [grid-area:bottom]">
          <CallWaveButton snap={snap} t={t} onCall={callWave} className="w-[420px]" />
        </footer>
      )}
    </div>
  );
}
