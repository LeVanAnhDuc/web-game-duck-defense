import type { TowerTypeId } from '../data/towers';
import type { ResolvedRules } from './upgrades';

/**
 * Kinh tế trong một trận. Mọi số ở đây là SỐ NGUYÊN — vàng không dùng float.
 */

export function buildCost(rules: ResolvedRules, towerId: TowerTypeId): number {
  return Math.round(rules.towers[towerId].cost * rules.buildCostMultiplier);
}

/** Giá lên bậc kế từ `level`. `null` nghĩa là đã ở bậc cuối. */
export function upgradeCostOf(
  rules: ResolvedRules,
  towerId: TowerTypeId,
  level: number,
): number | null {
  const levels = rules.towers[towerId].levels;
  if (level < 1 || level > levels.length) return null;
  return levels[level - 1].upgradeCost;
}

/**
 * Thu về khi bán: tổng đã tiêu cho tháp này nhân `sellRatio`, làm tròn XUỐNG.
 * Làm tròn xuống nên bán rồi xây lại không bao giờ là cách kiếm vàng.
 */
export function sellValue(
  rules: ResolvedRules,
  towerId: TowerTypeId,
  level: number,
): number {
  let spent = buildCost(rules, towerId);
  const levels = rules.towers[towerId].levels;
  for (let l = 1; l < level; l++) spent += levels[l - 1].upgradeCost ?? 0;
  return Math.floor(spent * rules.sellRatio);
}

/** Vàng nhận được khi giết một enemy, đã tính nhánh Kinh tế. */
export function bountyFor(rules: ResolvedRules, baseBounty: number): number {
  return Math.round(baseBounty * rules.bountyMultiplier);
}

/** Lãi trả sau mỗi đợt. 0 nếu chưa mua node `waveInterest`. */
export function waveInterest(rules: ResolvedRules, goldHeld: number): number {
  if (rules.waveInterestPct <= 0) return 0;
  return Math.floor((goldHeld * rules.waveInterestPct) / 100);
}
