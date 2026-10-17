import type { TowerTypeId } from '@/data/towers';
import type { StringKey } from '@/i18n';

/**
 * Khoa chuoi i18n suy tu id. Tach khoi component vi ba ham nay khong render gi,
 * va ca `TowerCard`, `TowerDetail`, `NextWaveStrip` deu dung.
 */
export const towerNameKey = (id: TowerTypeId): StringKey => `tower.${id}` as StringKey;
export const towerDescKey = (id: TowerTypeId): StringKey => `tower.${id}.desc` as StringKey;
export const enemyNameKey = (id: string): StringKey => `enemy.${id}` as StringKey;
