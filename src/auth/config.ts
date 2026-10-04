import type { DuckerConfig, DuckerEnv } from './types';

export const DUCKER_PKCE_KEY = 'ducker.pkce';

/**
 * Đăng nhập Ducker ID chỉ bật khi cờ = "true" VÀ đủ cả 4 giá trị.
 * Không có giá trị mặc định nào ở đây: thiếu là tắt, không đoán (ADR-0010).
 */
export function readDuckerConfig(raw: DuckerEnv): DuckerConfig | null {
  if (raw.enabled !== 'true') return null;
  const { issuer, clientId, scope, profilePath } = raw;
  if (!issuer || !clientId || !scope || !profilePath) return null;
  // "localhost:3000" là URL hợp lệ với scheme "localhost:" — chặn.
  if (!/^https?:\/\//.test(issuer)) return null;
  try {
    return {
      issuer: new URL(issuer).origin,
      clientId,
      scope,
      profileUrl: new URL(profilePath, issuer).toString(),
    };
  } catch {
    // issuer sai định dạng → coi như chưa cấu hình, game vẫn chạy
    return null;
  }
}

// Vite chỉ inline truy cập theo tên LITERAL — đây là chỗ duy nhất đọc các biến này.
export const DUCKER_CONFIG = readDuckerConfig({
  enabled: import.meta.env.VITE_FEATURE_DUCKER_SIGN_IN,
  issuer: import.meta.env.VITE_DUCKER_ISSUER,
  clientId: import.meta.env.VITE_DUCKER_CLIENT_ID,
  scope: import.meta.env.VITE_DUCKER_SCOPE,
  profilePath: import.meta.env.VITE_DUCKER_PROFILE_PATH,
});

/** Gốc app — redirect_uri phải khớp tuyệt đối với URI đã đăng ký ở Ducker ID. */
export function appRootPath(): string {
  return import.meta.env.BASE_URL;
}
