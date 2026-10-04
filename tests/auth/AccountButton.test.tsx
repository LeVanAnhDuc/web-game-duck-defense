// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('@/hooks/useDuckerAuth', () => ({ useDuckerAuth: () => auth.value }));

import { AccountButton } from '@/components/AccountButton';

const base = { enabled: true, profileUrl: 'http://localhost:3000/profile', signIn: vi.fn(), signOut: vi.fn() };

let host: HTMLDivElement;
let root: Root;

const mount = () => act(() => root.render(<AccountButton />));
const byName = (selector: string, name: string) =>
  [...host.querySelectorAll<HTMLElement>(selector)].find(
    (el) => el.textContent?.trim() === name || el.getAttribute('aria-label') === name,
  );

beforeEach(() => {
  base.signIn.mockClear();
  base.signOut.mockClear();
  localStorage.clear();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('AccountButton', () => {
  it('renders nothing when the feature is disabled', () => {
    auth.value = { ...base, enabled: false, status: 'idle', profile: null };
    mount();
    expect(host.innerHTML).toBe('');
  });

  it('shows the sign-in button when signed out and starts login on click', () => {
    auth.value = { ...base, status: 'signed-out', profile: null };
    mount();
    act(() => byName('button', 'Đăng nhập')!.click());
    expect(base.signIn).toHaveBeenCalledOnce();
  });

  it('disables the button while signing in', () => {
    auth.value = { ...base, status: 'loading', profile: null };
    mount();
    expect((byName('button', 'Đang đăng nhập…') as HTMLButtonElement).disabled).toBe(true);
  });

  it('opens the account menu with profile link and sign out; Esc closes and refocuses', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'Lê Văn Anh Đức', email: 'duc@ducker.id' } };
    mount();
    const trigger = byName('button', 'Tài khoản Ducker ID')!;
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(host.textContent).toContain('duc@ducker.id');
    const link = byName('[role="menuitem"]', 'Mở hồ sơ Ducker ID')!;
    expect(link.getAttribute('href')).toBe('http://localhost:3000/profile');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    act(() => trigger.click());
    act(() => byName('[role="menuitem"]', 'Đăng xuất')!.click());
    expect(base.signOut).toHaveBeenCalledOnce();
  });

  it('after sign out, focus lands on the sign-in button, not <body>', () => {
    const profile = { sub: 'u1', name: 'Đức', email: 'duc@ducker.id' };
    auth.value = { ...base, status: 'signed-in', profile };
    mount();
    act(() => byName('button', 'Tài khoản Ducker ID')!.click());
    // Kho thật đổi snapshot khi signOut; mô phỏng bằng cách đổi giá trị rồi render lại.
    base.signOut.mockImplementationOnce(() => {
      auth.value = { ...base, status: 'signed-out', profile: null };
    });
    act(() => byName('[role="menuitem"]', 'Đăng xuất')!.click());
    mount();
    expect(document.activeElement).toBe(byName('button', 'Đăng nhập'));
    expect(document.activeElement).not.toBe(document.body);
  });

  it('arrow keys, Home and End move focus between items with wrap-around', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'Đức', email: 'duc@ducker.id' } };
    mount();
    act(() => byName('button', 'Tài khoản Ducker ID')!.click());
    const link = byName('[role="menuitem"]', 'Mở hồ sơ Ducker ID')!;
    const out = byName('[role="menuitem"]', 'Đăng xuất')!;
    const press = (key: string) =>
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      });
    expect(document.activeElement).toBe(link);
    press('ArrowDown');
    expect(document.activeElement).toBe(out);
    press('ArrowDown');
    expect(document.activeElement).toBe(link);
    press('ArrowUp');
    expect(document.activeElement).toBe(out);
    press('Home');
    expect(document.activeElement).toBe(link);
    press('End');
    expect(document.activeElement).toBe(out);
  });

  it('Tab closes the menu without pulling focus back to the trigger', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'Đức' } };
    mount();
    const trigger = byName('button', 'Tài khoản Ducker ID')!;
    act(() => trigger.click());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).not.toBe(trigger);
  });

  it('shows the email as the main line when there is no name, and no email line when missing', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', email: 'zed@x.vn' } };
    mount();
    act(() => byName('button', 'Tài khoản Ducker ID')!.click());
    const lines = [...host.querySelectorAll('[role="menu"] p')].map((p) => p.textContent);
    expect(lines).toEqual(['zed@x.vn']);
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'Đức' } };
    mount();
    expect([...host.querySelectorAll('[role="menu"] p')].map((p) => p.textContent)).toEqual(['Đức']);
  });

  it('closes on an outside pointer press without stealing focus', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', email: 'zed@x.vn' } };
    mount();
    const trigger = byName('button', 'Tài khoản Ducker ID')!;
    act(() => trigger.click());
    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows an initial when there is no picture and an img when there is', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'đức' } };
    mount();
    expect(host.textContent).toContain('Đ');
    expect(host.querySelector('img')).toBeNull();
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'đức', picture: 'http://x/p.png' } };
    mount();
    expect(host.querySelector('img')?.getAttribute('src')).toBe('http://x/p.png');
  });
});
