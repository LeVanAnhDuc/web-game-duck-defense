import { describe, it, expect } from 'vitest';
import { LOCALES, translate, formatNumber } from '../../src/i18n';
import { vi } from '../../src/i18n/vi';
import { en } from '../../src/i18n/en';

describe('từ điển', () => {
  it('vi và en có ĐÚNG cùng bộ khoá, theo cả hai chiều', () => {
    const viKeys = Object.keys(vi).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(viKeys);
  });

  it('không có chuỗi rỗng ở bất kỳ locale nào', () => {
    for (const dict of [vi, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.length, `khoá ${key} rỗng`).toBeGreaterThan(0);
      }
    }
  });

  it('mọi chỗ {param} trong vi cũng có mặt trong en', () => {
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
    for (const key of Object.keys(vi) as (keyof typeof vi)[]) {
      expect(placeholders(en[key]), `khoá ${key} lệch placeholder`).toEqual(placeholders(vi[key]));
    }
  });
});

describe('translate', () => {
  it('trả về chuỗi của locale đang chọn', () => {
    expect(translate('vi', 'common.back')).toBe(vi['common.back']);
    expect(translate('en', 'common.back')).toBe(en['common.back']);
  });

  it('khoá lạ trả về CHÍNH KHOÁ, không trả undefined', () => {
    const key = 'khong.ton.tai' as never;
    expect(translate('vi', key)).toBe('khong.ton.tai');
  });

  it('thay các chỗ {param}', () => {
    const out = translate('en', 'title.mapsUnlocked', { n: 2, total: 5 });
    expect(out).toBe('2 of 5 maps open');
  });

  it('giữ nguyên placeholder khi thiếu tham số, để lỗi nhìn thấy được', () => {
    expect(translate('en', 'title.mapsUnlocked', { n: 2 })).toContain('{total}');
  });

  it('định dạng số theo locale (NFR-I18N-03)', () => {
    expect(formatNumber('vi', 1234)).toBe('1.234');
    expect(formatNumber('en', 1234)).toBe('1,234');
  });
});

/**
 * ĐO ĐƯỢC, không phỏng đoán.
 *
 * Tài liệu ban đầu ghi "chuỗi tiếng Việt dài hơn tiếng Anh ~30%". Đo trên từ
 * điển thật thì SAI: tổng tiếng Việt 2038 ký tự, tiếng Anh 2134 — tiếng Việt
 * NGẮN HƠN 4,5%. Tiếng Anh dài hơn ở 74 nhãn, tiếng Việt dài hơn ở 39 nhãn.
 * Dấu tiếng Việt không làm chữ rộng thêm, và nhiều từ Việt ngắn hơn ("Đợt" vs
 * "Wave").
 *
 * Ràng buộc đúng vì thế là THEO TỪNG NHÃN, không theo tổng: bố cục phải chịu
 * được bản DÀI HƠN của chính nhãn đó, và e2e phải kiểm CẢ HAI locale.
 * NFR-I18N-04 và MASTER.md §2 đã được sửa theo phát hiện này.
 */
describe('độ dài chuỗi', () => {
  it('không nhãn nào lệch nhau quá 2,5 lần giữa hai locale', () => {
    for (const key of Object.keys(vi) as (keyof typeof vi)[]) {
      const a = vi[key].length;
      const b = en[key].length;
      const ratio = Math.max(a, b) / Math.min(a, b);
      expect(ratio, `khoá ${key}: vi=${a} en=${b}`).toBeLessThanOrEqual(2.5);
    }
  });

  it('cả hai locale đều có nhãn dài hơn locale kia — không bên nào là "bản dài"', () => {
    let viLonger = 0;
    let enLonger = 0;
    for (const key of Object.keys(vi) as (keyof typeof vi)[]) {
      if (vi[key].length > en[key].length) viLonger++;
      else if (en[key].length > vi[key].length) enLonger++;
    }
    expect(viLonger).toBeGreaterThan(0);
    expect(enLonger).toBeGreaterThan(0);
  });

  it('có đúng hai locale', () => {
    expect(LOCALES).toEqual(['vi', 'en']);
  });
});
