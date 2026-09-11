import type { ReactNode } from 'react';

/**
 * Chip hiện một con số của HUD: icon + số, trên bề mặt lõm.
 *
 * `num` bật `tabular-nums`: tiền và mạng đổi liên tục, và chữ số không cùng bề
 * rộng thì cả thanh HUD rung — `MASTER.md` §2.
 */
type Props = {
  icon: ReactNode;
  value: ReactNode;
  /** Bắt buộc: một con số trần không nói được nó là gì cho screen reader. */
  label: string;
  /** Màu của SỐ. Icon thừa hưởng riêng. Chỉ dùng token đo được trên --sunken. */
  valueClassName?: string;
  iconClassName?: string;
  size?: 'md' | 'sm';
};

export function Chip({ icon, value, label, valueClassName = 'text-ink', iconClassName, size = 'md' }: Props) {
  const box = size === 'md' ? 'h-12 px-3 gap-1.5' : 'h-11 px-2.5 gap-1.5';
  const text = size === 'md' ? 'text-[length:var(--text-lg)]' : 'text-[length:var(--text-md)]';
  return (
    <div
      className={`flex items-center rounded-[var(--radius-md)] border-2 border-edge bg-sunken ${box}`}
      role="group"
      aria-label={label}
    >
      <span className={iconClassName} aria-hidden>{icon}</span>
      <span className={`disp num font-bold ${text} ${valueClassName}`}>{value}</span>
    </div>
  );
}
