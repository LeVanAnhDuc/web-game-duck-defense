import { LOCALES, type Locale } from '../../i18n';
import { IconBack } from '../components/Icon';
import { Press } from '../components/Press';
import { Segmented } from '../components/Segmented';
import { useLocale } from '../hooks/useLocale';
import { updateProfile, useProfileState } from '../hooks/useProfile';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { t, locale, setLocale } = useLocale();
  const { profile } = useProfileState();

  return (
    <div className="flex h-full flex-col bg-void">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b-2 border-edge bg-panel px-4 md:h-[72px] md:px-6">
        <Press onClick={onBack} aria-label={t('common.back')} className="flex w-11 items-center justify-center">
          <IconBack size={20} />
        </Press>
        <h1 className="disp text-[length:var(--text-2xl)] font-extrabold md:text-[length:var(--text-3xl)]">
          {t('settings.title')}
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-7 p-5 md:p-8">
        <section className="flex flex-col gap-2.5">
          {/* NFR-A11Y-04 — nhãn liên kết thật với nhóm điều khiển, không phải
              một dòng chữ đặt cạnh nó. */}
          <h2 className="disp text-[length:var(--text-lg)] font-bold" id="label-language">
            {t('settings.language')}
          </h2>
          <Segmented<Locale>
            ariaLabel={t('settings.language')}
            value={locale}
            onChange={setLocale}
            options={LOCALES.map((l) => ({ value: l, label: t(`locale.${l}`) }))}
          />
        </section>

        {/* MỘT thanh trượt, không phải hai.
            v1 không có nhạc nền (FR-18 đã thu hẹp, lý do ghi ở `backlog.md`
            §Nợ kỹ thuật), nên một thanh trượt "nhạc" sẽ điều khiển thứ không
            tồn tại. Trường `settings.music` vẫn nằm trong profile để không phải
            migrate schema chỉ vì bỏ một thanh trượt. */}
        <Volume
          id="sound"
          label={t('settings.sound')}
          value={profile.settings.sfx}
          onChange={(v) => updateProfile((p) => ({ ...p, settings: { ...p.settings, sfx: v } }))}
          offLabel={t('settings.off')}
        />
      </div>
    </div>
  );
}

function Volume({
  id, label, value, onChange, offLabel,
}: {
  id: string; label: string; value: number;
  onChange: (value: number) => void; offLabel: string;
}) {
  const percent = Math.round(value * 100);
  return (
    <section className="flex flex-col gap-2.5">
      <label htmlFor={`volume-${id}`} className="disp flex items-baseline text-[length:var(--text-lg)] font-bold">
        {label}
        <span className="num ml-auto text-[length:var(--text-md)] font-semibold text-dim">
          {percent === 0 ? offLabel : `${percent}%`}
        </span>
      </label>
      <input
        id={`volume-${id}`}
        type="range"
        min={0}
        max={100}
        step={5}
        value={percent}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="h-11 w-full cursor-pointer accent-[var(--ui-act)] focus-visible:outline-3 focus-visible:outline-act focus-visible:outline-offset-3"
      />
    </section>
  );
}
