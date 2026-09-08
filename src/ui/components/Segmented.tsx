import type { ReactNode } from 'react';

/**
 * Segmented control. Trạng thái "đang chọn" mang BA kênh, không chỉ màu nền —
 * `MASTER.md` §8, NFR-A11Y-06:
 *
 *   1. nền   --sunken → --ui-act
 *   2. nét chữ   600 → 800
 *   3. một vạch đặc 3px ép sát cạnh dưới BÊN TRONG ô — có / không có
 *
 * Vạch dùng `inset` shadow nên không ăn một pixel chiều ngang nào. Đó là lý do
 * chọn nó thay vì một dấu tròn: ở 375px, tab "Sát thương" chỉ còn ~12px dư, và
 * một dấu tròn 6px cộng gap 6px là đủ làm nhãn xuống dòng.
 */

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Nhãn cho screen reader nếu `label` không phải chữ. */
  ariaLabel?: string;
};

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nhãn của cả nhóm, bắt buộc — nhóm nút không có nhãn thì không đọc được. */
  ariaLabel: string;
  className?: string;
  cellClassName?: string;
};

export function Segmented<T extends string>({
  options, value, onChange, ariaLabel, className = '', cellClassName = '',
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`flex overflow-hidden rounded-[var(--radius-md)] border-2 border-edge shadow-[0_4px_0_0_var(--ui-edge)] ${className}`}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
            className={[
              'disp num flex min-h-[44px] flex-1 cursor-pointer items-center justify-center',
              'text-[length:var(--text-md)]',
              active ? 'bg-act font-extrabold text-on-act shadow-[inset_0_-3px_0_0_var(--ui-on-act)]' : 'bg-sunken font-semibold text-ink',
              index > 0 ? 'border-l-2 border-edge' : '',
              'focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-ink',
              cellClassName,
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
