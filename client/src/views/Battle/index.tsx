import { useCallback, useEffect, useRef, useState } from 'react';
import { pushIntent, resetBridge, type BattleSpeed } from '@/bridge';
import type { BattleOutcome } from '@/core/runBattle';
import type { UpgradeState } from '@/core/upgrades';
import type { MapId } from '@/data/maps';
import type { TowerTypeId } from '@/data/towers';
import { setAudioVolume, stopAllSounds } from '@/game/audio';
import { startGame, type GameHandle } from '@/game/boot';
import { Press } from '@/components/Press';
import { IconBack } from '@/components/Icon';
import { useLocale } from '@/hooks/useLocale';
import { useLayoutMode, type LayoutMode } from '@/hooks/useLayoutMode';
import { useProfileState } from '@/hooks/useProfile';
import { useSnapshot } from '@/hooks/useSnapshot';
import { SlotOverlay } from './components/SlotOverlay';

import { BattleShortcuts } from './ghosts/BattleShortcuts';
import { SyncAudioVolume } from './ghosts/SyncAudioVolume';
import { BattleLiveRegion } from './components/BattleLiveRegion';
import { CallWaveButton } from './components/CallWaveButton';
import { GoldChip } from './components/GoldChip';
import { LivesChip } from './components/LivesChip';
import { NextWaveStrip } from './components/NextWaveStrip';
import { PauseButton } from './components/PauseButton';
import { SelectedTowerPanel } from './components/SelectedTowerPanel';
import { SpeedControl } from './components/SpeedControl';
import { TowerCard } from './components/TowerCard';
import { TowerDetail } from './components/TowerDetail';
import { WaveBar } from './components/WaveBar';
import { WaveMeter } from './components/WaveMeter';
import { WaveNumber } from './components/WaveNumber';

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
  const { profile } = useProfileState();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const [pickedTower, setPickedTower] = useState<TowerTypeId | null>(null);
  /** NFR-REL-03 — nạp asset thất bại thì HIỆN LỖI + cho thử lại, không treo. */
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Seed sinh TRONG effect, không trong render: `Date.now()` là hàm không
    // thuần, và gọi nó lúc render cho ra giá trị khác mỗi lần React render lại.
    // Một lượt vào trận vì thế có đúng một seed, và trận đó tái tạo được.
    const seed = Date.now() & 0x7fffffff;

    resetBridge();
    setLoadError(null);
    const handle = startGame(host, {
      mapId,
      upgrades,
      seed,
      onFinish,
      onLoadError: (file) => setLoadError(file),
    });
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
  }, [mapId, attempt]);


  /*
   * Effect này KHÔNG tách thành ghost, và đó là một quyết định chứ không phải sót.
   *
   * Nó đọc `handleRef.current`, mà ref đó do effect mount engine của CHÍNH view này
   * đặt. Effect của con chạy TRƯỚC effect của cha, nên một ghost sẽ thấy ref còn
   * null ở lần mount đầu và bỏ qua lần đo lại — đúng cái lỗi canvas giữ kích thước
   * của bố cục cũ mà đoạn dưới đây tồn tại để chặn.
   *
   * Đổi bố cục làm khung canvas đổi kích thước mà KHÔNG có sự kiện resize của
   * window (lưới đổi, cửa sổ không đổi). Phaser chỉ nghe window resize.
   */
  useEffect(() => {
    handleRef.current?.refreshScale();
  }, [mode]);

  /**
   * NFR-A11Y-02 — đặt focus vào màn trận ngay khi nó hiện ra.
   *
   * Màn tiêu đề bị thay bằng màn này, nên nút "CHƠI" mà người dùng bàn phím vừa
   * bấm biến mất và focus rơi về `<body>`: không còn vòng focus nào trên màn hình
   * và không biết Tab tiếp sẽ đi đâu.
   *
   * Chỉ nhận focus khi nó đang thật sự vô chủ. Người dùng chuột không bị cướp
   * focus, và nếu có phần tử nào khác đã kịp nhận thì để yên cho nó.
   *
   * Phụ thuộc `ready` chứ không phải `[]`: cả thanh HUD — nút back nằm trong đó —
   * chỉ render sau khi snapshot ĐẦU TIÊN từ Phaser tới. Chạy một lần lúc mount
   * thì `backRef` còn null và không có gì nhận focus cả, đúng lỗi mà test
   * "focus không bao giờ rơi về <body>" bắt được.
   */
  const ready = snap !== null;
  useEffect(() => {
    if (!ready) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    backRef.current?.focus();
  }, [ready]);

  // Callback cho ghost phải ỔN ĐỊNH: ghost chạy lại theo nó.
  const applyVolume = useCallback((volume: number) => setAudioVolume(volume), []);

  const selection = snap?.selection ?? null;

  /**
   * Chạm một ô. KHÔNG BAO GIỜ trả tiền — FR-33.
   *
   * Bản trước: đang có loại tháp chọn sẵn mà chạm ô trống là xây luôn, trừ tiền
   * ngay. Người chơi vì thế không bao giờ thấy được tầm bắn trước khi mua, và
   * 2/3 persona tự đặt tháp trên bản đồ 1 đã đặt ngoài tầm với của đường đi rồi
   * thua với ~0 địch bị diệt. Giờ lần chạm này chỉ CHỌN Ô; vòng tầm bắn của loại
   * tháp đang chọn hiện ra ngay, và tiền chỉ đi khi bấm nút xây.
   */
  const pickSlot = useCallback((slotIndex: number) => {
    pushIntent({ kind: 'select', target: { kind: 'slot', slotIndex } });
  }, []);

  /**
   * Chạm một thẻ tháp = CHỌN ỨNG VIÊN, không phải mua.
   *
   * Chạm lại đúng thẻ đang chọn thì bỏ chọn. Không có đường nào từ một lần chạm
   * tới việc mất tiền — đó là cả điểm của FR-33.
   */
  const pickTower = useCallback((towerId: TowerTypeId) => {
    setPickedTower((current) => (current === towerId ? null : towerId));
  }, []);

  /** Thao tác DUY NHẤT trả tiền. */
  const confirmBuild = useCallback(() => {
    if (selection?.kind !== 'slot' || !pickedTower) return;
    pushIntent({ kind: 'build', slotIndex: selection.slotIndex, towerId: pickedTower });
    setPickedTower(null);
  }, [selection, pickedTower]);

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

  const clearSelection = useCallback(() => {
    pushIntent({ kind: 'select', target: null });
    setPickedTower(null);
  }, []);

  // Phím `1 2 3` giờ làm ĐÚNG một việc như chạm thẻ: chọn ứng viên. Tham số
  // `slotSelected` không còn đổi nghĩa gì nữa — giữ chữ ký để ghost không phải
  // biết chuyện này, nhưng hai nhánh đã hợp lại làm một.
  const chooseTower = useCallback((towerId: TowerTypeId) => pickTower(towerId), [pickTower]);

  /**
   * Vòng tầm bắn xem trước phải theo ứng viên, và phải TẮT khi không còn ô nào
   * được chọn — nếu không nó sẽ lơ lửng ở ô cũ sau khi bấm Esc.
   */
  useEffect(() => {
    handleRef.current?.setPreviewTower(selection?.kind === 'slot' ? pickedTower : null);
  }, [pickedTower, selection]);

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
          onPick={() => pickTower(option.towerId)}
        />
      ))}
    </div>
  ) : null;

  const shownTower = pickedTower ?? snap?.buildOptions[0]?.towerId ?? null;
  const shownOption = snap?.buildOptions.find((o) => o.towerId === shownTower) ?? null;
  const slotSelected = selection?.kind === 'slot';
  const canBuild = slotSelected && pickedTower !== null && (shownOption?.affordable ?? false);

  /**
   * Nút xác nhận — chỗ DUY NHẤT tiền rời khỏi túi người chơi (FR-33).
   *
   * Tách riêng vì nó phải có mặt ở CẢ BA bố cục. Bố cục ngang hẹp chỉ render
   * `towerRow` chứ không render cả `buildPanel`, nên nếu nút này nằm bên trong
   * `buildPanel` thì ở màn ngang hẹp người chơi chọn được tháp mà không bao giờ
   * xây được — luồng ba bước mà thiếu bước ba thì thành ngõ cụt.
   */
  const confirmRow =
    snap && slotSelected ? (
      <div className="flex gap-2.5">
        <Press
          variant="primary"
          disabled={!canBuild}
          onClick={confirmBuild}
          className="disp flex min-w-0 flex-1 items-center justify-center gap-2 text-[length:var(--text-md)] font-extrabold"
        >
          <span className="truncate">
            {pickedTower && shownOption
              ? t('battle.confirmBuild', { cost: shownOption.cost })
              : t('battle.pickTowerFirst')}
          </span>
        </Press>
        <Press
          onClick={clearSelection}
          aria-label={t('common.cancel')}
          className="disp flex flex-none items-center justify-center px-3 text-[length:var(--text-md)] font-bold"
        >
          {t('common.cancel')}
        </Press>
      </div>
    ) : null;

  const buildPanel = snap ? (
    <div className="flex flex-col gap-3">
      {/* Tiêu đề chỉ ở bố cục rộng. Ở dọc, bảng này sống trong thanh đáy và mỗi
          pixel nó lấy là một pixel bàn chơi mất — mà ba thẻ tháp có giá kèm icon
          xu thì đã tự nói nó là gì rồi. */}
      <h2 className="disp hidden text-[length:var(--text-lg)] font-extrabold md:block">
        {t('battle.buildTower')}
      </h2>
      {towerRow}
      <TowerDetail option={shownOption} t={t} />
      {/* Nút này là chỗ DUY NHẤT tiền rời khỏi túi người chơi — FR-33. Nó chỉ
          sống khi đã có ô được chọn, nên không bao giờ có chuyện bấm nhầm nó mà
          không biết tháp sẽ mọc ở đâu. */}
      {confirmRow}
    </div>
  ) : null;

  const backButton = (
    <Press
      ref={backRef}
      onClick={onQuit}
      aria-label={t('common.back')}
      className="flex w-11 items-center justify-center"
    >
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
        {snap && !loadError && <SlotOverlay mapId={mapId} snap={snap} t={t} onPickSlot={pickSlot} />}

        {/* NFR-REL-03 — lỗi nạp asset hiện thành LỚP PHỦ, không phải một màn
            riêng thay cả cây.
            Bản đầu `return` sớm ra một màn lỗi, và điều đó tháo luôn cái div mà
            Phaser bám vào: `hostRef.current` thành null, nên khi bấm "thử lại"
            effect chạy lại, không thấy host, và thoát ngay — game cũ đã bị huỷ,
            game mới không bao giờ khởi động, và màn lỗi ở lại vĩnh viễn. Giữ
            khung board luôn mounted thì thử lại mới thật sự là thử lại. */}
        {loadError && (
          <div
            role="alert"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-void/95 px-6 text-center"
          >
            <p className="disp text-[length:var(--text-xl2)] font-extrabold text-danger">
              {t('error.assetFailed')}
            </p>
            <p className="num max-w-[420px] break-all text-[length:var(--text-sm)] text-dim">
              {loadError}
            </p>
            <div className="flex gap-3">
              <Press
                variant="primary"
                onClick={() => {
                  setLoadError(null);
                  setAttempt((n) => n + 1);
                }}
                className="disp px-6 text-[length:var(--text-md)] font-extrabold"
              >
                {t('error.retry')}
              </Press>
              <Press onClick={onQuit} className="disp px-6 text-[length:var(--text-md)] font-bold">
                {t('common.back')}
              </Press>
            </div>
          </div>
        )}
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
          {/* Hàng tốc độ biến mất trong lúc đang chọn chỗ đặt tháp.
              Ở 375px thanh đáy và bàn chơi chia nhau cùng một chiều cao: bảng xây
              mở ra là bàn chơi tụt từ 375px xuống ~206px, mà bàn chơi lại đúng là
              chỗ người chơi phải nhìn để biết vòng tầm bắn có chạm đường đi không
              (FR-33). Tốc độ x1/x2/x3 không giúp gì cho quyết định đó, và nó quay
              lại ngay khi xây xong hoặc bấm Huỷ. */}
          {selection?.kind !== 'slot' && (
            <div className="flex items-center gap-2.5">
              <SpeedControl snap={snap} t={t} onChange={setSpeed} />
              {!selection && (
                <span className="ml-auto text-[length:var(--text-sm)] text-dim">
                  {t('battle.tapSlotToBuild')}
                </span>
              )}
            </div>
          )}
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
          {confirmRow}
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

      {/*
        Ghost: chỉ chạy side-effect, không vẽ gì (R-04). Đặt CUỐI danh sách con,
        không phải đầu: ghi chú trên `GRID` yêu cầu `board` luôn là con đầu tiên.
        Ghost render `null` nên nó không chiếm ô lưới nào.
      */}
      <SyncAudioVolume
        volume={profile.settings.sfx}
        onApply={applyVolume}
        onLeave={stopAllSounds}
      />
      <BattleShortcuts
        selection={selection}
        onEscape={clearSelection}
        onCallWave={callWave}
        onChooseTower={chooseTower}
      />
    </div>
  );
}
