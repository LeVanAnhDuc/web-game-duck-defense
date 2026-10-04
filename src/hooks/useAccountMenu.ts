import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hành vi của menu tài khoản, không có style: mở bằng click, đóng bằng Esc (trả
 * focus về nút mở) hoặc bấm ra ngoài (không giành focus của thứ vừa được bấm).
 */
export function useAccountMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close(true);
        return;
      }
      if (event.key === 'Tab') {
        close(false); // để Tab đi tiếp tự nhiên, không giành lại focus
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
      if (items.length === 0) return;
      event.preventDefault();
      const at = items.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (event.key === 'End') next = items.length - 1;
      else if (event.key === 'ArrowDown') next = (at + 1) % items.length;
      else if (event.key === 'ArrowUp') next = (at <= 0 ? items.length : at) - 1;
      items[next].focus();
    };
    const onFocusOut = (event: FocusEvent) => {
      const to = event.relatedTarget as Node | null;
      if (to && !menuRef.current?.contains(to) && !triggerRef.current?.contains(to)) close(false);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusout', onFocusOut);
    menuRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [open, close]);

  return { open, toggle: () => setOpen((value) => !value), close, triggerRef, menuRef };
}
