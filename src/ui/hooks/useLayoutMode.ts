import { useEffect, useState } from 'react';

/**
 * Ba bố cục của màn trận đấu, đúng ba nhóm mà `MASTER.md` §6 mô tả.
 *
 * Chọn bằng `matchMedia` trong JS chứ không bằng chuỗi breakpoint rải khắp
 * class: bố cục ở đây không phải "cùng thứ nhỏ hơn" mà là BA cách sắp khác
 * nhau — HUD ở trên, HUD ở hai mép, HUD thành cột phải. Viết thành ba nhánh
 * tường minh thì đọc được; viết thành mười class điều kiện thì không.
 *
 *   • `portrait`          — canvas trên, HUD dính trên, điều khiển dính đáy
 *   • `landscapeCompact`  — canvas giữa, HUD ở hai dải mép (điện thoại nằm ngang)
 *   • `wide`              — canvas + cột phải cố định, thanh HUD trên và dưới
 */
export type LayoutMode = 'portrait' | 'landscapeCompact' | 'wide';

const WIDE = '(min-width: 768px) and (min-height: 600px)';
const LANDSCAPE_COMPACT = '(orientation: landscape) and (max-height: 599px)';

function currentMode(): LayoutMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'portrait';
  if (window.matchMedia(WIDE).matches) return 'wide';
  if (window.matchMedia(LANDSCAPE_COMPACT).matches) return 'landscapeCompact';
  return 'portrait';
}

export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(currentMode);

  useEffect(() => {
    if (!window.matchMedia) return;
    const queries = [window.matchMedia(WIDE), window.matchMedia(LANDSCAPE_COMPACT)];
    const update = () => setMode(currentMode());
    for (const query of queries) query.addEventListener('change', update);
    update();
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
  }, []);

  return mode;
}
