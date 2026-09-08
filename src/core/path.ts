import type { Point } from '../data/maps';

/**
 * Polyline mà enemy đi trên đó.
 *
 * Enemy lưu `s` — quãng đường đã đi — chứ không lưu toạ độ (`invariants.md` #2).
 * File này là chỗ duy nhất đổi `s` thành toạ độ.
 */
export type Path = {
  waypoints: Point[];
  segmentLengths: number[];
  /** `cumulative[i]` = quãng đường tới waypoint thứ i. `cumulative[0] === 0`. */
  cumulative: number[];
  length: number;
};

export function buildPath(waypoints: Point[]): Path {
  if (waypoints.length < 2) throw new Error('path cần ít nhất hai waypoint');
  const segmentLengths: number[] = [];
  const cumulative: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    const len = Math.hypot(dx, dy);
    segmentLengths.push(len);
    cumulative.push(cumulative[i - 1] + len);
  }
  return { waypoints, segmentLengths, cumulative, length: cumulative[cumulative.length - 1] };
}

/**
 * Toạ độ tại quãng đường `s`.
 * `s` ngoài khoảng [0, length] bị KẸP, không ngoại suy — enemy không bao giờ
 * lệch khỏi đường vì nó không có khái niệm "lệch".
 */
export function pathAt(path: Path, s: number): Point {
  if (s <= 0) return { x: path.waypoints[0].x, y: path.waypoints[0].y };
  const last = path.waypoints[path.waypoints.length - 1];
  if (s >= path.length) return { x: last.x, y: last.y };

  let i = 1;
  while (i < path.cumulative.length - 1 && path.cumulative[i] < s) i++;

  const segStart = path.cumulative[i - 1];
  const segLen = path.segmentLengths[i - 1];
  const t = segLen === 0 ? 0 : (s - segStart) / segLen;
  const a = path.waypoints[i - 1];
  const b = path.waypoints[i];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
