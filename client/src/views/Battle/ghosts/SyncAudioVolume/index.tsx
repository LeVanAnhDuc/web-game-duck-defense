import { useEffect } from 'react';

/**
 * Đưa âm lượng từ profile vào tầng âm thanh, và **tắt hết tiếng khi rời trận**.
 *
 * Ghost: chỉ chạy side-effect, không vẽ gì (R-04).
 *
 * Hai effect nằm cùng một ghost vì chúng là hai nửa của một vòng đời: một nửa
 * đồng bộ âm lượng, một nửa dọn tiếng còn đang phát lúc component rời đi. Tách
 * chúng ra hai ghost thì thứ tự giữa chúng trở thành một thứ phải nhớ.
 */
export function SyncAudioVolume({
  volume,
  onApply,
  onLeave,
}: {
  volume: number;
  onApply: (volume: number) => void;
  /** Gọi lúc rời trận. Phải ổn định, nếu không nó chạy ở mỗi lần render. */
  onLeave: () => void;
}) {
  useEffect(() => {
    onApply(volume);
  }, [volume, onApply]);

  useEffect(() => onLeave, [onLeave]);

  return null;
}
