import { forwardRef } from 'react';
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

/*
 * `forwardRef` để màn trận đặt được focus vào một nút cụ thể khi màn hình đổi
 * (NFR-A11Y-02). Không có ref thì chỗ gọi phải đi tìm nút bằng selector, và một
 * selector là thứ lặng lẽ hỏng khi ai đó đổi nhãn.
 */
export const Press = forwardRef<HTMLButtonElement, Props>(function Press(
  { variant = 'raised', className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
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
        // `aria-disabled` trông y hệt `disabled` nhưng GIỮ nút trong tab order.
        // Đây là cách chữa gốc cho NFR-A11Y-02: một nút `disabled` bị gỡ khỏi
        // tab order ngay lúc nó disable, nên nếu nó đang giữ focus thì trình
        // duyệt thả focus về `<body>` và người dùng bàn phím mất dấu hoàn toàn.
        // Nút "gọi đợt" tự disable ngay sau khi bấm, nên nó rơi vào đúng bẫy đó.
        'aria-disabled:cursor-not-allowed aria-disabled:bg-sunken aria-disabled:text-dim',
        'aria-disabled:shadow-[0_4px_0_0_var(--ui-edge)] aria-disabled:active:translate-y-0',
        'aria-disabled:hover:brightness-100',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
});
