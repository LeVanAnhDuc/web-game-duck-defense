import type { EnemyTypeId } from '../data/enemies';
import type { TowerTypeId } from '../data/towers';

/**
 * Chỉ mục frame trong tilesheet của Kenney Tower Defense (CC0).
 *
 * Sheet là **1472×832, tile 64px, 23 cột × 13 hàng**, nên chỉ mục frame của
 * Phaser = `hàng × 23 + cột`, đếm từ 0. Các con số dưới đây được xác định bằng
 * cách phủ lưới chỉ mục lên chính sheet rồi đọc, không phải đoán — tên file
 * trong pack chỉ là `towerDefense_tile001..300` nên không nói gì về nội dung.
 *
 * License: `public/assets/kenney/License.txt`.
 */
export const SHEET_KEY = 'td';
export const SHEET_URL = 'assets/kenney/towerDefense_tilesheet.png';
export const TILE = 64;
export const SHEET_COLUMNS = 23;

/** Ô cỏ trơn, lát kín bàn chơi. */
export const FRAME_GRASS = 157;

/** Bệ tháp — khối bát giác xám. Nòng vẽ chồng lên nó. */
export const FRAME_TOWER_BASE = 181;

/**
 * Nòng tháp. Mọi sprite nòng trong pack đều CHĨA LÊN, nên khi quay theo mục
 * tiêu phải cộng thêm π/2 — xem `TURRET_ROTATION_OFFSET`.
 */
export const TURRET_FRAME: Record<TowerTypeId, number> = {
  arrow: 203, // nòng đôi nhỏ, bắn nhanh
  cannon: 227, // miệng loe, nổ lan
  frost: 226, // bản dẹt
  bolt: 205, // giá ba tên
  venom: 206, // một ống phóng
};

export const TURRET_ROTATION_OFFSET = Math.PI / 2;

/**
 * Enemy. Pack chỉ có hai thân tăng (xanh 249, đỏ 250) và một máy bay xanh
 * (270), nên ba loại địch được phân biệt bằng SPRITE KHÁC NHAU chứ không bằng
 * tint: tint nhân màu, và tô một thân tăng xanh thành cam chỉ cho ra màu bùn.
 *
 * Máy bay dùng cho `runner` là chủ ý — nó đọc ngay ra "con này nhanh" mà không
 * cần nhãn, và pack TD của Kenney vốn có máy bay đúng cho vai đó.
 */
export const ENEMY_FRAME: Record<EnemyTypeId, number> = {
  grunt: 249,
  armored: 250,
  runner: 270,
};

/** Đường kính vẽ, đơn vị bản đồ. Địch có giáp to hơn để nhìn là biết. */
export const ENEMY_DRAW_SIZE: Record<EnemyTypeId, number> = {
  grunt: 30,
  armored: 34,
  runner: 28,
};

export const ENEMY_ROTATION_OFFSET = Math.PI / 2;

/**
 * Màu đường đi, LẤY MẪU từ chính tilesheet (`#BB8044` ô đất, `#E0D1AF` ô cát).
 *
 * Đường vẫn vẽ bằng vector chứ không bằng tile của pack, và đây là lý do:
 * đường của Kenney là **tile 64px trên lưới** (đoạn thẳng + góc), còn bản đồ
 * trong `data/maps/` là polyline tự do ở toạ độ bất kỳ (84, 128, 196…). Muốn
 * dùng tile đường thì phải vẽ lại cả năm bản đồ trên lưới 64, và mọi chiều dài
 * đường đổi theo — tức là cân bằng lại từ đầu. Xem `backlog.md` §Nợ kỹ thuật.
 *
 * Lấy mẫu màu từ pack là cách để đường vector không lệch tông với sprite.
 */
export const PATH_FILL = 0xe0d1af;
export const PATH_EDGE = 0xbb8044;

/**
 * Màu cỏ, lấy mẫu từ ô 157. Dùng làm nền đặc BÊN DƯỚI lớp ô cỏ, để nếu có hở
 * một pixel giữa hai ô thì lộ ra cỏ chứ không lộ ra vùng ngoài canvas.
 */
export const GRASS_FILL = 0x2ecc71;

/** Thứ tự lớp vẽ. Giữ ở một chỗ để không ai đoán. */
export const DEPTH = {
  grass: 0,
  path: 1,
  slots: 2,
  enemy: 5,
  tower: 6,
  effects: 7,
  overlay: 8,
} as const;
