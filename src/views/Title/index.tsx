import { MAP_ORDER, waveCount } from '@/data/maps';
import type { StringKey } from '@/i18n';
import { unlockedMaps } from '@/storage/profile';
import { IconCore, IconGear, IconMap, IconPlay, IconWrench } from '@/components/Icon';
import { Press } from '@/components/Press';
import { Segmented } from '@/components/Segmented';
import { useLocale } from '@/hooks/useLocale';
import { useProfileState } from '@/hooks/useProfile';

type Props = {
  onPlay: () => void;
  onMaps: () => void;
  onWorkshop: () => void;
  onSettings: () => void;
};

/**
 * Màn tiêu đề. MỘT hành động chính, đúng pattern hero-centric mà bước 1 của
 * `design-bootstrap` giữ lại cho riêng màn này (`MASTER.md` §10).
 *
 * Nút chính đổi chữ theo tiến trình: người mới thấy "CHƠI", người quay lại thấy
 * "CHƠI TIẾP" kèm tên bản đồ đang dở (US-03). Hai nút phụ không tranh chỗ với nó.
 */
export function TitleScreen({ onPlay, onMaps, onWorkshop, onSettings }: Props) {
  const { t, locale, setLocale } = useLocale();
  const { profile } = useProfileState();

  const open = unlockedMaps(profile);
  const resumeMap = profile.lastMap ?? open[open.length - 1] ?? MAP_ORDER[0];
  const hasProgress = profile.lastMap !== null || open.length > 1;
  const record = profile.maps[resumeMap];

  return (
    <div className="flex h-full flex-col bg-void">
      <div className="flex flex-none justify-end px-5 pt-4 md:px-10 md:pt-6">
        <Segmented<'vi' | 'en'>
          ariaLabel={t('settings.language')}
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'vi', label: 'VI', ariaLabel: t('locale.vi') },
            { value: 'en', label: 'EN', ariaLabel: t('locale.en') },
          ]}
          className="w-[116px]"
        />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center gap-7 px-5 md:gap-9">
        <div className="text-center">
          <h1 className="disp text-[length:var(--text-hero)] font-extrabold leading-none tracking-tight md:text-[length:var(--text-hero-lg)]">
            {t('app.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-[300px] text-[length:var(--text-md)] leading-relaxed text-dim md:mt-3.5 md:max-w-[460px] md:text-[length:var(--text-lg)]">
            {t('app.tagline')}
          </p>
        </div>

        <div className="flex w-[280px] flex-col gap-3 md:w-[340px]">
          <Press
            variant="primary"
            onClick={onPlay}
            className="disp flex h-14 items-center justify-center gap-2.5 text-[length:var(--text-lg)] font-extrabold md:h-16 md:text-[length:var(--text-xl2)]"
          >
            <IconPlay size={19} />
            {hasProgress ? t('title.continue') : t('title.play')}
          </Press>
          {hasProgress && (
            <p className="text-center text-[length:var(--text-sm)] text-dim">
              {t('title.lastMap', {
                map: t(`map.${resumeMap}` as StringKey),
                wave: Math.max(1, record?.bestWave ?? 1),
                total: waveCount(resumeMap),
              })}
            </p>
          )}
        </div>

        <div className="flex w-[280px] flex-col gap-3 md:w-[500px] md:flex-row md:justify-center">
          <Press
            onClick={onMaps}
            className="disp flex items-center justify-center gap-2.5 text-[length:var(--text-md)] font-bold md:w-[236px]"
          >
            <IconMap size={18} />
            {t('title.mapSelect')}
          </Press>
          <Press
            onClick={onWorkshop}
            className="disp flex items-center justify-center gap-2.5 text-[length:var(--text-md)] font-bold md:w-[236px]"
          >
            <IconWrench size={18} />
            {t('title.workshop')}
          </Press>
        </div>
      </main>

      <footer className="flex flex-none items-center gap-3.5 px-5 pb-5 md:px-10 md:pb-8">
        <span className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-dim">
          <IconMap size={16} aria-hidden />
          {t('title.mapsUnlocked', { n: open.length, total: MAP_ORDER.length })}
        </span>
        <span className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-dim">
          <span className="text-core" aria-hidden><IconCore size={16} /></span>
          <span className="num font-semibold text-core">{profile.cores}</span>
          {t('common.cores')}
        </span>
        <Press
          onClick={onSettings}
          aria-label={t('common.settings')}
          className="ml-auto flex w-11 items-center justify-center"
        >
          <IconGear size={20} />
        </Press>
      </footer>
    </div>
  );
}
