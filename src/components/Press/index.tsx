import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Signature element của dự án: cạnh dưới đặc 4px, tụt xuống khi ấn.
 * `MASTER.md` §4.
 *
 * Ba lý do nó ở đây và ở ĐÚNG một chỗ:
 *
 * 1. `min-h-[44px]` nằm trên chính component, nên không caller nào giao được
 *    một vùng bấm 40px (NFR-A11Y-03). Đặt luật ở component thì không cần nhớ.
 * 2. Trạng thái *bị ấn* thay cho `hover` làm affordance: cảm ứng không có hover,
 *    và thiết kế nào đặt affordance vào hover là bỏ rơi một nửa người chơi
 *    (`MASTER.md` §5).
 * 3. Dưới `prefers-reduced-motion` chỉ cần bỏ transition — trạng thái vẫn đọc
 *    được vì nó là VỊ TRÍ, không phải chuyển động. CSS toàn cục trong
 *    `tailwind.css` đã lo phần đó.
 */

type Variant = 'primary' | 'raised' | 'sunken';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const SURFACE: Record<Variant, string> = {
  // Chỉ --ui-ink được đặt trên --raised; chữ màu phải đổi bề mặt sang --sunken.
  // MASTER.md §1.1b.
  primary: 'bg-act text-on-act',
  raised: 'bg-raised text-ink',
  sunken: 'bg-sunken text-ink',
};

export function Press({ variant = 'raised', className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={[
        SURFACE[variant],
        'min-h-[44px] cursor-pointer select-none',
        'rounded-[var(--radius-md)] border-2 border-edge',
        'shadow-[0_4px_0_0_var(--ui-edge)]',
        'transition-[transform,box-shadow,filter] duration-[60ms] ease-out',
        'active:translate-y-[4px] active:shadow-none',
        'hover:brightness-[1.06]',
        'focus-visible:outline-3 focus-visible:outline-act focus-visible:outline-offset-[3px]',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-dim',
        'disabled:shadow-[0_4px_0_0_var(--ui-edge)] disabled:active:translate-y-0',
        'disabled:hover:brightness-100',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
