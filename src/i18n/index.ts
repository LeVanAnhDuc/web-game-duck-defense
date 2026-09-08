import { en } from './en';
import { vi, type StringKey } from './vi';

export type Locale = 'vi' | 'en';
export type { StringKey };

export const LOCALES: Locale[] = ['vi', 'en'];

const DICTS: Record<Locale, Record<StringKey, string>> = { vi, en };

/**
 * Tra một chuỗi hiển thị.
 *
 * Khoá không có trong từ điển trả về CHÍNH KHOÁ, không trả `undefined`: một
 * nhãn hiện ra là `battle.callWave` thì thấy ngay, còn `undefined` thì hiện
 * thành ô trống và không ai để ý.
 *
 * `params` thay các chỗ `{tên}`. Số được định dạng theo locale (NFR-I18N-03).
 */
export function translate(
  locale: Locale,
  key: StringKey,
  params?: Record<string, string | number>,
): string {
  const raw = DICTS[locale]?.[key] ?? DICTS.vi[key] ?? key;
  if (!params) return raw;

  return raw.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = params[name];
    if (value === undefined) return whole;
    return typeof value === 'number' ? formatNumber(locale, value) : value;
  });
}

/** NFR-I18N-03 — số theo locale người chơi. */
export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-GB').format(value);
}

export { vi, en };
