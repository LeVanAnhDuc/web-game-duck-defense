import { useEffect, useRef, useState } from 'react';
import { IconExternalLink, IconLogOut, IconUser } from '@/components/Icon';
import { Press } from '@/components/Press';
import { useAccountMenu } from '@/hooks/useAccountMenu';
import { useDuckerAuth } from '@/hooks/useDuckerAuth';
import { useLocale } from '@/hooks/useLocale';
import { initialOf } from '@/lib/initials';

/**
 * Nút đăng nhập Ducker ID + menu tài khoản (ADR-0010). Chỉ danh tính: không đụng tới
 * profile game hay tiến trình.
 *
 * Cờ tắt ⇒ `null`, không một node DOM nào. Màu theo MASTER.md §1.1b: chữ `--ui-ink`
 * trên `--raised`/`--panel`, avatar `--ui-act` + `--ui-on-act`; không đỏ/xanh lá làm
 * màu tương tác. Trạng thái "đang đăng nhập" đổi bề mặt sang `--sunken` + `--ui-dim`
 * (qua `disabled:` của `Press`), không dùng opacity.
 */

// Mục menu dạng liên kết: cùng chữ ký "cạnh dưới đặc" như `Press` nhưng là thẻ <a>.
const ITEM =
  'disp flex min-h-[44px] w-full items-center gap-2.5 rounded-[var(--radius-md)] border-2 border-edge ' +
  'bg-raised px-3 text-[length:var(--text-md)] font-bold text-ink shadow-[0_4px_0_0_var(--ui-edge)] ' +
  'transition-[transform,box-shadow,filter] duration-[60ms] ease-out active:translate-y-[4px] active:shadow-none ' +
  'hover:brightness-[1.06] focus-visible:outline-3 focus-visible:outline-act focus-visible:outline-offset-[3px]';

export function AccountButton() {
  const auth = useDuckerAuth();
  const { open, toggle, close, triggerRef, menuRef } = useAccountMenu();
  const { t } = useLocale();
  const signInRef = useRef<HTMLButtonElement>(null);
  const refocusSignIn = useRef(false);
  const [brokenPicture, setBrokenPicture] = useState<string | null>(null);

  // Sau "Đăng xuất" nút mở menu biến mất; đưa focus sang nút đăng nhập cùng chỗ, không để rơi về <body>.
  useEffect(() => {
    if (refocusSignIn.current && auth.status === 'signed-out') {
      refocusSignIn.current = false;
      signInRef.current?.focus();
    }
  });

  if (!auth.enabled) return null;

  if (auth.status !== 'signed-in' || !auth.profile) {
    const loading = auth.status === 'loading';
    return (
      <Press
        ref={signInRef}
        onClick={auth.signIn}
        // `idle` (trước khi store khởi động) cũng khoá: cùng kích thước, không bấm được.
        disabled={loading || auth.status === 'idle'}
        aria-busy={loading}
        className="disp flex flex-none items-center justify-center gap-2 px-3 text-[length:var(--text-md)] font-bold"
      >
        <IconUser size={18} />
        <span>{loading ? t('account.signingIn') : t('account.signIn')}</span>
      </Press>
    );
  }

  const { profile } = auth;
  const label = profile.name?.trim() || profile.email?.trim() || '';

  return (
    <div className="relative min-w-0">
      <Press
        ref={triggerRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('account.menuLabel')}
        className="flex w-full max-w-[190px] items-center gap-2 py-1 pl-1 pr-3"
      >
        {profile.picture && brokenPicture !== profile.picture ? (
          <img
            src={profile.picture}
            alt=""
            width={32}
            height={32}
            referrerPolicy="no-referrer"
            onError={() => setBrokenPicture(profile.picture ?? null)}
            className="h-8 w-8 flex-none rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="disp flex h-8 w-8 flex-none items-center justify-center rounded-full bg-act text-[length:var(--text-md)] font-extrabold text-on-act"
          >
            {initialOf(profile)}
          </span>
        )}
        <span className="disp min-w-0 truncate text-[length:var(--text-md)] font-bold">{label}</span>
      </Press>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 flex w-[260px] max-w-[calc(100vw-2.5rem)] flex-col gap-3 rounded-[var(--radius-lg)] border-2 border-edge bg-panel p-3 shadow-[0_4px_0_0_var(--ui-edge)]"
        >
          <div role="none" className="min-w-0 px-1">
            {label && <p className="disp truncate text-[length:var(--text-md)] font-bold text-ink">{label}</p>}
            {profile.name?.trim() && profile.email && (
              <p className="truncate text-[length:var(--text-sm)] text-dim">{profile.email}</p>
            )}
          </div>
          <a
            role="menuitem"
            href={auth.profileUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => close(false)}
            className={ITEM}
          >
            <IconExternalLink size={18} />
            {t('account.openProfile')}
          </a>
          <Press
            role="menuitem"
            onClick={() => {
              close(false);
              refocusSignIn.current = true;
              auth.signOut();
            }}
            className="disp flex w-full items-center gap-2.5 px-3 text-[length:var(--text-md)] font-bold"
          >
            <IconLogOut size={18} />
            {t('account.signOut')}
          </Press>
        </div>
      )}
    </div>
  );
}
