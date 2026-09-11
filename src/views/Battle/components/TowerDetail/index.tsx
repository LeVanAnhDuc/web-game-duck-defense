import type { BattleSnapshot } from '@/bridge';
import type { Translate } from '@/hooks/useLocale';
import { towerNameKey, towerDescKey } from '@/lib/towerStrings';

type BuildOption = BattleSnapshot['buildOptions'][number];

/**
 * Bảng số liệu của loại tháp đang xem — FR-33.
 *
 * Trước đây chỗ này chỉ có tên và một dòng mô tả, và người chơi tower defense lâu
 * năm nói thẳng ra cái thiếu: *"Không có số liệu trước khi mua, phải đặt xuống mới
 * biết."* Ba con số dưới đây đến TRƯỚC thời điểm trả tiền, và chúng đã gồm bậc
 * nâng cấp toàn cục (invariants #8) nên là số thật của trận này.
 */
export function TowerDetail({ option, t }: { option: BuildOption | null; t: Translate }) {
  if (!option) {
    return (
      <p className="rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3 text-[length:var(--text-sm)] leading-relaxed text-dim">
        {t('battle.tapSlotToBuild')}
      </p>
    );
  }

  // 60 tick = 1 giây (invariants #4). Hiện bằng giây vì "110 tick" không nói gì
  // với người chơi, còn "1,8 s" thì có.
  //
  // Làm tròn tới 1 chữ số RỒI mới đưa cho `t` dưới dạng SỐ, không phải chuỗi:
  // `translate` chỉ định dạng theo locale khi tham số là number (NFR-I18N-03), và
  // nếu không làm tròn trước thì 50/60 ra "0,833".
  const seconds = Math.round((option.cooldownTicks / 60) * 10) / 10;

  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border-2 border-edge bg-sunken p-3">
      <span className="disp text-[length:var(--text-md)] font-bold">{t(towerNameKey(option.towerId))}</span>
      <span className="text-[length:var(--text-sm)] leading-relaxed text-dim">
        {t(towerDescKey(option.towerId))}
      </span>
      {/* MỘT dòng, không phải lưới ba cột có nhãn xếp trên giá trị.
          Ở 375px bảng xây nằm trong thanh đáy, và thanh đáy cao thêm bao nhiêu
          thì bàn chơi thấp đi bấy nhiêu — lưới hai tầng ăn mất ~60px chiều cao
          của chính thứ người chơi đang nhìn. */}
      <dl className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[length:var(--text-sm)]">
        <Stat label={t('battle.statDamage')} value={String(option.damage)} />
        <Stat label={t('battle.statRange')} value={String(Math.round(option.range))} />
        <Stat label={t('battle.statRate')} value={t('battle.seconds', { n: seconds })} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <dt className="text-dim">{label}</dt>
      <dd className="num font-bold">{value}</dd>
    </span>
  );
}

/* ── panel tháp đã chọn ───────────────────────────────────────────────────── */
