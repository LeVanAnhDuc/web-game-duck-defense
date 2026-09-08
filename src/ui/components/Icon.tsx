/**
 * Icon vẽ bằng SVG inline, nét, trên lưới 24.
 *
 * `MASTER.md` §8 cấm emoji làm icon: emoji không đổi màu theo token, hiện khác
 * nhau trên từng hệ điều hành, và bị screen reader đọc thành tên emoji.
 *
 * Mọi icon nhận `color` mặc định `currentColor`, nên chúng thừa hưởng màu chữ
 * của chỗ đặt và không cần biết token nào đang dùng.
 */

type Props = {
  size?: number;
  className?: string;
  /** Icon trang trí thì để trống; icon MANG NGHĨA thì phải có nhãn. */
  label?: string;
};

const base = (size: number, label?: string) =>
  ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    role: label ? 'img' : undefined,
    focusable: false,
  });

export const IconPause = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className} fill="currentColor" stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const IconPlay = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className} fill="currentColor" stroke="none">
    <path d="M7 4l12 8-12 8z" />
  </svg>
);

export const IconHeart = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className} fill="currentColor" stroke="none">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const IconCoin = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v9M9.6 10h4.8M9.6 14h4.8" />
  </svg>
);

export const IconCore = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M12 3l7 5v8l-7 5-7-5V8z" />
    <path d="M12 9.5l3 2v3l-3 2-3-2v-3z" />
  </svg>
);

export const IconLock = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </svg>
);

export const IconBack = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const IconClose = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconWrench = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M15.5 6.5a3.8 3.8 0 0 1-4.9 4.9L4 18v2.5h2.5l6.6-6.6a3.8 3.8 0 0 1 4.9-4.9l-2.6 2.6" />
  </svg>
);

export const IconMap = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M3 6.5l6-2.5 6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5z" />
    <path d="M9 4v13M15 7v13" />
  </svg>
);

export const IconGear = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.1}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
  </svg>
);

export const IconCheck = ({ size = 18, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.8}>
    <path d="M4 12.5l5.5 5.5L20 6" />
  </svg>
);

export const IconArrow = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.4}>
    <path d="M4 20L20 4M20 4h-7M20 4v7" />
  </svg>
);

export const IconBomb = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.4}>
    <circle cx="10" cy="15" r="6" />
    <path d="M15 10l4-4M17.5 4.5h3v3" />
  </svg>
);

export const IconSnow = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.4}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
  </svg>
);

export const IconBolt = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.4}>
    <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
  </svg>
);

export const IconDrop = ({ size = 22, className, label }: Props) => (
  <svg {...base(size, label)} className={className} strokeWidth={2.4}>
    <path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z" />
  </svg>
);

export const IconSkull = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M12 3a7 7 0 0 0-7 7v3l2 1.5V18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.5L19 13v-3a7 7 0 0 0-7-7z" />
    <circle cx="9.5" cy="11" r="1.4" fill="currentColor" />
    <circle cx="14.5" cy="11" r="1.4" fill="currentColor" />
  </svg>
);

export const IconTrophy = ({ size = 20, className, label }: Props) => (
  <svg {...base(size, label)} className={className}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
    <path d="M12 14v3M9 20h6" />
  </svg>
);
