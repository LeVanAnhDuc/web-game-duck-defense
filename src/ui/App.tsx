import { useCallback, useEffect, useState } from 'react';
import type { BattleOutcome } from '../core/runBattle';
import { coresAward } from '../core/rewards';
import { MAP_ORDER, type MapId } from '../data/maps';
import { setAudioVolume, unlockAudio } from '../game/audio';
import { unlockedMaps, type Profile } from '../storage/profile';
import { StorageNotice } from './battle/parts';
import { useLocale } from './hooks/useLocale';
import { dismissStorageNotice, updateProfile, useProfileState } from './hooks/useProfile';
import { BattleScreen } from './screens/BattleScreen';
import { MapSelectScreen } from './screens/MapSelectScreen';
import { ResultScreen, type ResultInfo } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TitleScreen } from './screens/TitleScreen';
import { WorkshopScreen } from './screens/WorkshopScreen';

/**
 * Điều phối màn hình. Một enum, KHÔNG router — đây là một SPA một màn, không có
 * URL nào đáng chia sẻ và không có trang nào đáng bookmark (ADR-0006 §4).
 */
type Screen =
  | { name: 'title' }
  | { name: 'maps' }
  | { name: 'workshop' }
  | { name: 'settings' }
  | { name: 'battle'; mapId: MapId }
  | { name: 'result'; info: ResultInfo };

export function App() {
  const { t } = useLocale();
  const { profile, recovered, repaired, writable } = useProfileState();
  const [screen, setScreen] = useState<Screen>({ name: 'title' });

  useEffect(() => {
    setAudioVolume(profile.settings.sfx);
  }, [profile.settings.sfx]);

  const startBattle = useCallback((mapId: MapId) => {
    // `AudioContext` phải được tạo TỪ TRONG một tương tác thật: Safari và
    // Chrome mobile chặn phát tự động, và một context tạo lúc nạp trang sẽ ở
    // `suspended` mãi. Mọi đường vào trận đều đi qua đây, và đều là một cú bấm.
    unlockAudio();
    updateProfile((p) => ({ ...p, lastMap: mapId }));
    setScreen({ name: 'battle', mapId });
  }, []);

  /**
   * Trận kết thúc: tính lõi, ghi profile, sang màn kết quả.
   *
   * Đây là chỗ DUY NHẤT ghi tiến trình sau một trận — `invariants.md` #11 cấm
   * ghi theo tick, và `core/` không bao giờ ghi gì (`architecture.md` §4).
   */
  const finishBattle = useCallback(
    (mapId: MapId) => (outcome: BattleOutcome) => {
      const previous = profile.maps[mapId];
      const alreadyCleared = previous.cleared;
      const cores = coresAward(outcome.waveReached, outcome.won, alreadyCleared);

      updateProfile((p): Profile => {
        const record = p.maps[mapId];
        return {
          ...p,
          cores: p.cores + cores,
          lastMap: mapId,
          maps: {
            ...p.maps,
            [mapId]: {
              cleared: record.cleared || outcome.won,
              bestWave: Math.max(record.bestWave, outcome.waveReached),
              bestLives: outcome.won ? Math.max(record.bestLives, outcome.livesLeft) : record.bestLives,
            },
          },
        };
      });

      setScreen({
        name: 'result',
        info: {
          mapId,
          outcome,
          coresEarned: cores,
          firstClear: outcome.won && !alreadyCleared,
          replay: alreadyCleared,
        },
      });
    },
    [profile.maps],
  );

  const playNext = useCallback(() => {
    const open = unlockedMaps(profile);
    const target = profile.lastMap ?? open[open.length - 1] ?? MAP_ORDER[0];
    startBattle(target);
  }, [profile, startBattle]);

  // `recovered` và `repaired` cùng một thông báo: cả hai đều là "dữ liệu cũ có
  // vấn đề, đã xử lý". Người chơi không cần biết khác biệt kỹ thuật giữa chúng;
  // hai cờ tách nhau là để CODE xử lý khác nhau, không phải để UI nói khác nhau.
  const notice = recovered || repaired
    ? t('storage.recovered')
    : !writable
      ? t('storage.notWritable')
      : null;

  return (
    <div className="flex h-full flex-col">
      {notice && <StorageNotice message={notice} onDismiss={dismissStorageNotice} t={t} />}

      <div className="min-h-0 flex-1">
        {screen.name === 'title' && (
          <TitleScreen
            onPlay={playNext}
            onMaps={() => setScreen({ name: 'maps' })}
            onWorkshop={() => setScreen({ name: 'workshop' })}
            onSettings={() => setScreen({ name: 'settings' })}
          />
        )}

        {screen.name === 'maps' && (
          <MapSelectScreen
            onBack={() => setScreen({ name: 'title' })}
            onPick={startBattle}
            onWorkshop={() => setScreen({ name: 'workshop' })}
          />
        )}

        {screen.name === 'workshop' && <WorkshopScreen onBack={() => setScreen({ name: 'title' })} />}

        {screen.name === 'settings' && <SettingsScreen onBack={() => setScreen({ name: 'title' })} />}

        {screen.name === 'battle' && (
          <BattleScreen
            key={screen.mapId}
            mapId={screen.mapId}
            upgrades={profile.upgrades}
            onFinish={finishBattle(screen.mapId)}
            onQuit={() => setScreen({ name: 'maps' })}
          />
        )}

        {screen.name === 'result' && (
          <ResultScreen
            info={screen.info}
            onRetry={() => startBattle(screen.info.mapId)}
            onNextMap={startBattle}
            onWorkshop={() => setScreen({ name: 'workshop' })}
            onMaps={() => setScreen({ name: 'maps' })}
          />
        )}
      </div>
    </div>
  );
}
