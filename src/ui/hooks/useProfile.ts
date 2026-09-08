import { useSyncExternalStore } from 'react';
import { loadProfile, saveProfile, type LoadResult, type Profile } from '../../storage/profile';

/**
 * Kho profile dùng chung, đọc bằng `useSyncExternalStore`.
 *
 * Là kho ở tầng module chứ không phải React Context vì nó cần đọc được cả từ
 * ngoài cây component (ví dụ khi trận kết thúc), và vì nó chỉ có một bản duy
 * nhất trong cả ứng dụng.
 *
 * Ghi chỉ xảy ra khi trận kết thúc hoặc người chơi đổi cài đặt — KHÔNG theo
 * tick (`invariants.md` #11).
 */

let snapshot: LoadResult | null = null;
const listeners = new Set<() => void>();

function ensure(): LoadResult {
  snapshot ??= loadProfile();
  return snapshot;
}

function emit(): void {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Thay profile rồi ghi xuống đĩa. Ghi thất bại thì cập nhật `writable`. */
export function updateProfile(change: (previous: Profile) => Profile): void {
  const current = ensure();
  const next = change(current.profile);
  const ok = saveProfile(next);
  snapshot = { ...current, profile: next, writable: ok };
  emit();
}

/** Người chơi đã đọc thông báo về dữ liệu hỏng / được sửa; đừng hiện lại. */
export function dismissStorageNotice(): void {
  const current = ensure();
  snapshot = { ...current, recovered: false, repaired: false };
  emit();
}

export function useProfileState(): LoadResult {
  return useSyncExternalStore(subscribe, ensure, ensure);
}

/** Chỉ dùng trong test và khi cần đọc ngoài React. */
export function readProfileState(): LoadResult {
  return ensure();
}

/** Chỉ dùng trong test. */
export function resetProfileStore(): void {
  snapshot = null;
  listeners.clear();
}
