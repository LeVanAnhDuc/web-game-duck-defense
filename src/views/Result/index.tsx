import type { BattleOutcome } from '@/core/runBattle';
import { FIRST_CLEAR_BONUS } from '@/core/rewards';
import { MAP_ORDER, waveCount, type MapId } from '@/data/maps';
import type { StringKey } from '@/i18n';
import { IconCore, IconMap, IconSkull, IconTrophy, IconWrench } from '@/components/Icon';
import { Press } from '@/components/Press';
import { useLocale } from '@/hooks/useLocale';

export type ResultInfo = {
  mapId: MapId;
  outcome: BattleOutcome;
  coresEarned: number;
  /** Lần thắng đầu tiên của bản đồ này — quyết định có hiện thưởng lần đầu. */
  firstClear: boolean;
  /** Chơi lại bản đồ đã thắng — lõi bị giảm, và phải NÓI ra (US-02). */
  replay: boolean;
};

type Props = {
  info: ResultInfo;
  onRetry: () => void;
  onNextMap: (mapId: MapId) => void;
  onWorkshop: () => void;
  onMaps: () => void;
};

/**
 * Màn kết quả. Thua vẫn trả lõi — "thua không phải về không" (US-02), nên số
 * lõi luôn hiện, không chỉ hiện khi thắng.
 *
 * Thắng và thua phân biệt bằng BA kênh chứ không chỉ màu (NFR-A11Y-06): icon
 * cúp / đầu lâu, chữ "Thắng" / "Thua", và màu.
 */
export function ResultScreen({ info, onRetry, onNextMap, onWorkshop, onMaps }: Props) {
  const { t } = useLocale();
  const { outcome, mapId, coresEarned, firstClear, replay } = info;

  const index = MAP_ORDER.indexOf(mapId);
  const nextMap = outcome.won && index >= 0 && index < MAP_ORDER.length - 1 ? MAP_ORDER[index + 1] : null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 bg-void px-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className={outcome.won ? 'text-ok' : 'text-danger'} aria-hidden>
          {outcome.won ? <IconTrophy size={44} /> : <IconSkull size={44} />}
        </span>
        <h1
          className={`disp text-[length:var(--text-hero)] font-extrabold leading-none ${
            outcome.won ? 'text-ok' : 'text-danger'
          }`}
        >
          {outcome.won ? t('result.won') : t('result.lost')}
        </h1>
        <p className="disp text-[length:var(--text-xl2)] font-bold">{t(`map.${mapId}` as StringKey)}</p>
      </div>

      <dl className="flex w-full max-w-[340px] flex-col gap-2.5 rounded-[var(--radius-lg)] border-2 border-edge bg-panel p-4">
        <Row
          label={t('result.wavesSurvived', { wave: outcome.waveReached, total: waveCount(mapId) })}
          value=""
        />
        <Row label={t('result.livesLeft', { n: outcome.livesLeft })} value="" />
        <Row label={t('result.killed', { n: outcome.killed })} value="" />
        <div className="h-0.5 bg-edge" />
        <div className="flex items-center">
          <dt className="flex items-center gap-2 text-[length:var(--text-md)]">
            <span className="text-core" aria-hidden><IconCore size={18} /></span>
            {t('common.cores')}
          </dt>
          <dd className="disp num ml-auto text-[length:var(--text-xl2)] font-extrabold text-core">
            +{coresEarned}
          </dd>
        </div>
        {firstClear && (
          <p className="text-[length:var(--text-sm)] text-ok">
            {t('result.firstClear', { n: FIRST_CLEAR_BONUS })}
          </p>
        )}
        {replay && <p className="text-[length:var(--text-sm)] text-dim">{t('result.replayReduced')}</p>}
      </dl>

      <div className="flex w-full max-w-[340px] flex-col gap-3">
        {nextMap ? (
          <Press
            variant="primary"
            onClick={() => onNextMap(nextMap)}
            className="disp flex h-14 items-center justify-center gap-2.5 text-[length:var(--text-lg)] font-extrabold"
          >
            <IconMap size={18} />
            {t('result.nextMap')}
          </Press>
        ) : (
          <Press
            variant="primary"
            onClick={onRetry}
            className="disp flex h-14 items-center justify-center text-[length:var(--text-lg)] font-extrabold"
          >
            {t('result.retry')}
          </Press>
        )}
        <div className="flex gap-3">
          {nextMap && (
            <Press onClick={onRetry} className="disp flex-1 text-[length:var(--text-md)] font-bold">
              {t('result.retry')}
            </Press>
          )}
          <Press
            onClick={onWorkshop}
            className="disp flex flex-1 items-center justify-center gap-2 text-[length:var(--text-md)] font-bold"
          >
            <IconWrench size={18} />
            {t('result.toWorkshop')}
          </Press>
        </div>
        <Press onClick={onMaps} variant="sunken" className="disp text-[length:var(--text-md)] font-bold">
          {t('result.toMapSelect')}
        </Press>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <dt className="text-[length:var(--text-md)] text-dim">{label}</dt>
      <dd className="disp num ml-auto font-bold">{value}</dd>
    </div>
  );
}
