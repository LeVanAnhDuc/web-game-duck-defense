import { MAPS, MAP_ORDER, waveCount, type MapId } from '@/data/maps';
import type { StringKey } from '@/i18n';
import { lockReason } from '@/storage/profile';
import { Chip } from '@/components/Chip';
import { IconBack, IconCheck, IconCore, IconLock, IconMap, IconWrench } from '@/components/Icon';
import { Press } from '@/components/Press';
import { useLocale } from '@/hooks/useLocale';
import { useProfileState } from '@/hooks/useProfile';

type Props = {
  onBack: () => void;
  onPick: (mapId: MapId) => void;
  onWorkshop: () => void;
};

export function MapSelectScreen({ onBack, onPick, onWorkshop }: Props) {
  const { t } = useLocale();
  const { profile } = useProfileState();

  return (
    <div className="flex h-full flex-col bg-void">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b-2 border-edge bg-panel px-4 md:h-[72px] md:px-6 lg:px-8">
        <Press onClick={onBack} aria-label={t('common.back')} className="flex w-11 items-center justify-center">
          <IconBack size={20} />
        </Press>
        <h1 className="disp text-[length:var(--text-2xl)] font-extrabold md:text-[length:var(--text-3xl)]">
          {t('mapSelect.title')}
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <Chip
            icon={<IconCore size={18} />}
            iconClassName="text-core"
            value={profile.cores}
            valueClassName="text-core"
            label={`${t('common.cores')}: ${profile.cores}`}
            size="sm"
          />
          <Press
            onClick={onWorkshop}
            className="disp hidden items-center justify-center gap-2 px-4 text-[length:var(--text-md)] font-bold lg:flex"
          >
            <IconWrench size={18} />
            {t('title.workshop')}
          </Press>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 content-start gap-3.5 overflow-y-auto p-4 md:grid-cols-2 md:gap-5 md:p-6 lg:grid-cols-3 lg:p-8">
        {MAP_ORDER.map((id, index) => (
          <MapCard key={id} mapId={id} number={index + 1} onPick={onPick} />
        ))}
      </div>

      <footer className="flex-none px-4 pb-4 md:px-6 md:pb-6 lg:hidden">
        <Press
          onClick={onWorkshop}
          className="disp flex h-14 w-full items-center justify-center gap-2.5 text-[length:var(--text-lg)] font-extrabold"
        >
          <IconWrench size={20} />
          {t('title.workshop')}
        </Press>
      </footer>
    </div>
  );
}

function MapCard({
  mapId, number, onPick,
}: { mapId: MapId; number: number; onPick: (id: MapId) => void }) {
  const { t } = useLocale();
  const { profile } = useProfileState();
  const record = profile.maps[mapId];
  const blockedBy = lockReason(profile, mapId);
  const locked = blockedBy !== null;

  // Trạng thái khoá KHÔNG dùng opacity trên cả thẻ — nó kéo chữ xuống dưới sàn
  // tương phản (MASTER.md §1.1b). Grayscale chỉ áp lên hình thumbnail.
  const badge = record.cleared ? (
    <span className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-semibold text-ok">
      <IconCheck size={16} aria-hidden />
      {t('mapSelect.cleared')}
    </span>
  ) : locked ? (
    <span className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-semibold text-dim">
      <IconLock size={16} aria-hidden />
      {t('mapSelect.locked')}
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-semibold text-act">
      <IconMap size={16} aria-hidden />
      {t('mapSelect.playing')}
    </span>
  );

  const detail = locked
    ? t('mapSelect.needsPrevious', { map: t(`map.${blockedBy}` as StringKey) })
    : record.cleared
      ? t('mapSelect.clearedDetail', { total: waveCount(mapId), lives: record.bestLives })
      : record.bestWave > 0
        ? t('mapSelect.best', { wave: record.bestWave, total: waveCount(mapId) })
        : t('mapSelect.notPlayed');

  return (
    /*
     * KHÔNG có `!min-h-0` ở đây, và đó là cả phát hiện F-03 — bất biến #13.
     *
     * Thẻ này là grid item. Bỏ sàn `min-height` đi thì nó mất luôn "automatic
     * minimum size", nên khi lưới thiếu chỗ dọc nó KHÔNG đẩy container ra cuộn —
     * nó nén mọi hàng xuống cho vừa. Ở 375×720 lưới một cột, năm hàng bị ép còn
     * 99px mỗi hàng; thumbnail `flex-none` giữ nguyên 88px, khối chữ cao 76px chỉ
     * còn ~11px, và `overflow-hidden` nuốt trọn. Không lỗi console, không chữ cắt
     * dở — mất sạch tên bản đồ, trạng thái và lý do khoá. Trên desktop lưới có
     * 2-3 cột nên mỗi hàng đủ chỗ và lỗi không bao giờ lộ ra.
     *
     * `min-h-fit` là cái khoá: thẻ không bao giờ được nhỏ hơn nội dung của nó.
     */
    <Press
      variant={locked ? 'sunken' : 'raised'}
      disabled={locked}
      onClick={() => onPick(mapId)}
      className="flex min-h-fit flex-row items-stretch overflow-hidden !rounded-[var(--radius-lg)] !p-0 text-left md:flex-col"
    >
      <span
        className={`relative block h-auto w-[104px] flex-none self-stretch bg-letterbox md:h-28 md:w-full ${
          locked ? 'grayscale-[0.8] brightness-[0.6]' : ''
        }`}
        aria-hidden
      >
        <MapThumb mapId={mapId} />
        {locked && (
          <span className="absolute inset-0 flex items-center justify-center bg-[rgba(10,18,25,0.55)] text-ink">
            <IconLock size={28} />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3.5 py-3 md:justify-start md:pb-3 md:pt-2.5">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="disp num text-[length:var(--text-lg)] font-extrabold text-dim">{number}.</span>
          <span className="disp text-[length:var(--text-lg)] font-extrabold">{t(`map.${mapId}` as StringKey)}</span>
          <span className="ml-auto">{badge}</span>
        </span>
        <span className="text-[length:var(--text-sm)] leading-snug text-dim">{detail}</span>
      </span>
    </Press>
  );
}

/**
 * Thumbnail bản đồ: chính polyline của bản đồ đó, vẽ bằng SVG.
 *
 * Không phải ảnh: đường đi là dữ liệu trong `data/`, nên vẽ từ dữ liệu thì
 * thumbnail không bao giờ lệch với bản đồ thật. Một ảnh PNG sẽ lệch ngay lần
 * đầu ai sửa waypoint.
 */
function MapThumb({ mapId }: { mapId: MapId }) {
  const map = MAPS[mapId];
  const d = map.waypoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 400 400" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="400" fill="#4E7B45" />
      <g fill="#55834B">
        {Array.from({ length: 400 }, (_, i) => i)
          .filter((i) => ((i % 20) + Math.floor(i / 20)) % 2 === 0 && i < 400)
          .map((i) => (
            <rect key={i} x={(i % 20) * 20} y={Math.floor(i / 20) * 20} width="20" height="20" />
          ))}
      </g>
      <path d={d} fill="none" stroke="#96743F" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#CBA96D" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
