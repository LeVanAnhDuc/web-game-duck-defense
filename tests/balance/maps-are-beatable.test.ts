import { describe, expect, it } from 'vitest';
import { minUpgradesForMap, runBattle } from '../../src/core/runBattle';
import { fullUpgradeState } from '../../src/core/upgrades';
import { MAPS, MAP_ORDER } from '../../src/data/maps';
import { runBattleAffordable } from './affordablePlayer';

/**
 * FR-32 — cổng chặn bản đồ bất khả thi. Test quan trọng nhất trong dự án.
 *
 * `overview.md` §6 chỉ số 3: mỗi bản đồ phải thắng được ở mức nâng cấp thấp
 * nhất người chơi có thể có lúc nó vừa mở. Vi phạm điều đó nghĩa là người chơi
 * bị kẹt, và đường ra duy nhất là cày lại bản đồ cũ — tức là bị PHẠT vì đã tiến
 * lên. Đó là hỏng nghiêm trọng nhất mà thiết kế này có thể mắc.
 *
 * `minUpgradesForMap` trả về cây TRỐNG cho mọi bản đồ, nên cổng này đảm bảo một
 * điều mạnh hơn hẳn: không người chơi nào có thể bị kẹt, vì mọi bản đồ đều
 * thắng được mà không cần một bậc nâng cấp nào.
 *
 * KHI TEST NÀY ĐỎ: sửa số trong `src/data/`, KHÔNG sửa assertion.
 */
describe('FR-32 · mọi bản đồ thắng được ở mức nâng cấp tối thiểu', () => {
  for (const id of MAP_ORDER) {
    const map = MAPS[id];

    it(`${id} — bố cục tham chiếu thắng khi được cấp sẵn`, () => {
      const o = runBattle(id, map.referenceLayout, minUpgradesForMap(id), 1);
      expect(o.won).toBe(true);
      expect(o.waveReached).toBe(map.waves.length);
    });

    it(`${id} — thắng được kể cả khi phải TỰ KIẾM tiền dựng bố cục đó`, () => {
      // Câu hỏi thật: người chơi có KỊP dựng bố cục không, chứ không phải bố cục
      // có đủ mạnh không. `runBattle` cấp tháp miễn phí nên nó không trả lời
      // được câu này — xem `affordablePlayer.ts`.
      const o = runBattleAffordable(id, minUpgradesForMap(id), 1);
      expect(o.won).toBe(true);
      expect(o.waveReached).toBe(map.waves.length);
    });

    it(`${id} — vẫn thắng với cây nâng cấp mua hết`, () => {
      // Chiều ngược lại: nâng cấp không được phép PHÁ bản đồ (ví dụ đổi mục tiêu
      // ngắm hoặc bán kính nổ theo cách làm tháp bắn trượt).
      const o = runBattleAffordable(id, fullUpgradeState(), 1);
      expect(o.won).toBe(true);
    });

    it(`${id} — kết quả không phụ thuộc seed`, () => {
      for (const seed of [1, 2, 99, 12345]) {
        expect(runBattleAffordable(id, minUpgradesForMap(id), seed).won).toBe(true);
      }
    });
  }
});

/**
 * Tín hiệu mềm về độ khó, không phải điều kiện thắng/thua.
 *
 * Người chơi mô phỏng ở đây là HOÀN HẢO: nó đi theo một bố cục do người thiết kế
 * chọn, tiêu đúng đồng vàng cuối, không bấm sai bao giờ. Siết số cho tới khi nó
 * mất mạng là cách làm ra một game không người thật nào qua được — nên các số
 * dưới đây được ghi lại để đọc, không để chặn.
 */
describe('đường cong độ khó — quan sát, không chặn', () => {
  it('in ra số mạng còn lại và thời lượng của từng bản đồ', () => {
    const rows: string[] = [];
    let totalMinutes = 0;
    for (const id of MAP_ORDER) {
      const map = MAPS[id];
      const o = runBattleAffordable(id, minUpgradesForMap(id), 1);
      const minutes = o.ticks / 3600;
      totalMinutes += minutes;
      rows.push(
        `${id}: ${o.livesLeft}/${map.startLives} mạng · ${map.waves.length} đợt · ` +
          `${minutes.toFixed(1)} phút · ${o.killed} diệt · ${o.leaked} lọt`,
      );
    }
    console.log(rows.join('\n'));
    console.log(`tổng thời lượng một lượt hoàn hảo: ${totalMinutes.toFixed(1)} phút`);

    // Chỉ chặn cái vô lý: một lượt hoàn hảo không thể dài hơn ba tiếng.
    expect(totalMinutes).toBeLessThan(180);
  });
});
