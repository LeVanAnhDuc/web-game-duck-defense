/**
 * Hiệu ứng âm thanh, TỔNG HỢP bằng WebAudio — không có file âm thanh nào.
 *
 * Lý do không dùng file: mỗi tiếng ở đây dài dưới 0,3 giây và là một hình bao
 * đơn giản trên một dao động. Tổng hợp tại chỗ tốn khoảng 60 dòng, không thêm
 * một byte nào vào bundle (NFR-PERF-08), và không phải đi tìm asset có giấy
 * phép hợp lệ.
 *
 * NHẠC NỀN không có trong v1 — xem `backlog.md` §Nợ kỹ thuật và FR-18. Đó là
 * lý do màn cài đặt chỉ có MỘT thanh trượt "âm thanh": một thanh trượt điều
 * khiển thứ không tồn tại thì tệ hơn là không có thanh trượt đó.
 *
 * `AudioContext` KHÔNG được tạo lúc nạp trang: Safari và Chrome mobile chặn
 * phát tự động, và tạo context trước tương tác đầu tiên sẽ để nó ở trạng thái
 * `suspended` mãi. `unlock()` được gọi từ tương tác thật đầu tiên (`design.md`
 * §5).
 */

export type SoundName = 'shoot' | 'splash' | 'kill' | 'build' | 'upgrade' | 'leak' | 'win' | 'lose';

type Spec = {
  /** Tần số đầu → cuối, Hz. */
  from: number;
  to: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  /** Số tick tối thiểu giữa hai lần phát cùng loại, tính bằng ms. */
  throttleMs: number;
};

const SPECS: Record<SoundName, Spec> = {
  shoot: { from: 880, to: 620, duration: 0.06, type: 'square', gain: 0.1, throttleMs: 55 },
  splash: { from: 260, to: 90, duration: 0.16, type: 'sawtooth', gain: 0.16, throttleMs: 90 },
  kill: { from: 200, to: 70, duration: 0.12, type: 'triangle', gain: 0.14, throttleMs: 40 },
  build: { from: 420, to: 780, duration: 0.1, type: 'triangle', gain: 0.2, throttleMs: 0 },
  upgrade: { from: 600, to: 1100, duration: 0.14, type: 'triangle', gain: 0.2, throttleMs: 0 },
  leak: { from: 320, to: 110, duration: 0.3, type: 'sawtooth', gain: 0.24, throttleMs: 120 },
  win: { from: 520, to: 1180, duration: 0.5, type: 'triangle', gain: 0.24, throttleMs: 0 },
  lose: { from: 420, to: 120, duration: 0.7, type: 'sawtooth', gain: 0.24, throttleMs: 0 },
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.8;
const lastPlayed = new Map<SoundName, number>();

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Tạo `AudioContext`. Phải gọi từ TRONG một tương tác thật của người chơi.
 * Gọi nhiều lần là vô hại.
 */
export function unlockAudio(): void {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return; // trình duyệt không có WebAudio: game vẫn chơi được, chỉ im
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  } catch {
    ctx = null; // bị chặn hẳn: im lặng, không throw
  }
}

export function setAudioVolume(next: number): void {
  volume = Math.max(0, Math.min(1, next));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.01);
}

export function playSound(name: SoundName): void {
  if (!ctx || !master || volume <= 0) return;

  const spec = SPECS[name];
  const now = ctx.currentTime;
  const nowMs = now * 1000;
  const last = lastPlayed.get(name);
  if (spec.throttleMs > 0 && last !== undefined && nowMs - last < spec.throttleMs) return;
  lastPlayed.set(name, nowMs);

  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = spec.type;
  osc.frequency.setValueAtTime(spec.from, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.to), now + spec.duration);

  // Hình bao: lên rất nhanh rồi tắt dần. Không có attack thì nghe ra tiếng "cạch".
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(spec.gain, now + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

  osc.connect(env).connect(master);
  osc.start(now);
  osc.stop(now + spec.duration + 0.02);
}

/** Dùng khi rời màn trận đấu. Giữ context lại — tạo lại tốn hơn nhiều. */
export function stopAllSounds(): void {
  lastPlayed.clear();
}
