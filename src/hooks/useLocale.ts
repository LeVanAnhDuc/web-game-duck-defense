import { translate, type Locale, type StringKey } from '@/i18n';
import { updateProfile, useProfileState } from './useProfile';

export type Translate = (key: StringKey, params?: Record<string, string | number>) => string;

/**
 * Ngôn ngữ hiện tại + hàm tra chuỗi.
 *
 * Ngôn ngữ nằm trong profile chứ không trong state của React, nên đổi ngôn ngữ
 * được ghi xuống đĩa ngay và lần mở sau vẫn giữ (US-04). Đổi KHÔNG cần tải lại
 * trang: mọi component đọc qua hook này nên chúng render lại cùng lúc.
 */
export function useLocale(): { locale: Locale; t: Translate; setLocale: (l: Locale) => void } {
  const { profile } = useProfileState();
  const locale = profile.locale;

  return {
    locale,
    t: (key, params) => translate(locale, key, params),
    setLocale: (next) => updateProfile((p) => ({ ...p, locale: next })),
  };
}
