import type { CallbackResult, DuckerConfig, PendingAuth } from './types';
import { DUCKER_CONFIG, DUCKER_PKCE_KEY, appRootPath } from './config';
import { challengeOf, randomUrlSafeToken } from './pkce';

const CALLBACK_PARAMS = ['code', 'state', 'error', 'error_description', 'iss'];

/** Chỉ nhận đường dẫn nội bộ: bắt đầu bằng "/" và không phải "//" (protocol-relative). */
export function isSafeReturnTo(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

export function redirectUri(): string {
  return new URL(appRootPath(), window.location.origin).toString();
}

function readPending(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(DUCKER_PKCE_KEY);
    return raw ? (JSON.parse(raw) as PendingAuth) : null;
  } catch {
    return null;
  }
}

function clearPending(): void {
  try {
    sessionStorage.removeItem(DUCKER_PKCE_KEY);
  } catch {
    // sessionStorage bị chặn — coi như không có phiên chờ
  }
}

/** Dựng URL authorize rồi chuyển cả trang sang Ducker ID. */
export async function startLogin(config: DuckerConfig): Promise<void> {
  const verifier = randomUrlSafeToken();
  const state = randomUrlSafeToken();
  const pending: PendingAuth = {
    state,
    verifier,
    returnTo: window.location.pathname + window.location.search,
  };
  try {
    sessionStorage.setItem(DUCKER_PKCE_KEY, JSON.stringify(pending));
  } catch {
    return; // không cất được verifier thì đừng đi, sẽ kẹt ở callback
  }
  const url = new URL('/oauth/authorize', config.issuer);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri());
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', await challengeOf(verifier));
  url.searchParams.set('code_challenge_method', 'S256');
  window.location.assign(url.toString());
}

/**
 * Đọc ?code / ?error rồi dọn ĐÚNG các tham số OAuth khỏi URL. Code chỉ dùng được
 * một lần, để lại trên URL thì F5 sẽ đem đổi lần nữa.
 */
export function consumeCallback(): CallbackResult | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  const state = params.get('state');
  if (!code && !error) return null;

  const pending = readPending();
  clearPending();
  for (const key of CALLBACK_PARAMS) params.delete(key);
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
  );

  // redirect_uri là gốc app trần, nên lỗi/huỷ cũng phải trả người chơi về chỗ cũ.
  const returnTo = isSafeReturnTo(pending?.returnTo) ? pending.returnTo : undefined;
  if (error) return { error, returnTo };
  if (!pending || pending.state !== state) return { error: 'state_mismatch' };
  return { code: code ?? undefined, verifier: pending.verifier, returnTo };
}

let captured: CallbackResult | null = null;
let didCapture = false;

/** Chạy một lần khi module nạp trên trình duyệt, trước mọi code game đọc URL. */
export function captureCallback(): void {
  if (didCapture) return;
  didCapture = true;
  captured = consumeCallback();
  if (captured?.returnTo) {
    try {
      window.history.replaceState(window.history.state, '', captured.returnTo);
    } catch {
      // URL không dùng được — giữ URL đã dọn
    }
  }
}

export function capturedCallback(): CallbackResult | null {
  return captured;
}

/** Chỉ dành cho test. */
export function resetCaptureForTests(): void {
  captured = null;
  didCapture = false;
}

// Cờ tắt ⇒ module này không đọc cả `location.search`.
if (typeof window !== 'undefined' && DUCKER_CONFIG) captureCallback();
