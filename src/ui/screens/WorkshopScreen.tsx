import { useState } from 'react';
import {
  BRANCH_ORDER, TOTAL_TREE_COST, UPGRADE_NODE_IDS, UPGRADE_TREE,
  nodesInBranch, type UpgradeBranch, type UpgradeNode, type UpgradeNodeId,
} from '../../data/upgradeTree';
import type { StringKey } from '../../i18n';
import type { Profile } from '../../storage/profile';
import { Chip } from '../components/Chip';
import { IconBack, IconBolt, IconCoin, IconCore, IconDrop, IconLock } from '../components/Icon';
import { Press } from '../components/Press';
import { Segmented } from '../components/Segmented';
import { useLocale, type Translate } from '../hooks/useLocale';
import { updateProfile, useProfileState } from '../hooks/useProfile';

const levelOf = (profile: Profile, id: UpgradeNodeId): number => profile.upgrades[id] ?? 0;

/** Điều kiện tiên quyết chưa đạt, hoặc `null` nếu đã mở. FR-13 đòi LÝ DO. */
function unmetPrereq(profile: Profile, node: UpgradeNode): { id: UpgradeNodeId; level: number } | null {
  for (const req of node.prereq) {
    if (levelOf(profile, req.id) < req.level) return req;
  }
  return null;
}

export function canBuy(profile: Profile, id: UpgradeNodeId): boolean {
  const node = UPGRADE_TREE[id];
  const level = levelOf(profile, id);
  if (level >= node.maxLevel) return false;
  if (unmetPrereq(profile, node)) return false;
  return profile.cores >= node.costs[level];
}

/**
 * Mua một bậc. Đọc bậc từ STATE, không từ giá đã render — nên bấm hai lần rất
 * nhanh sẽ trừ giá bậc 1 rồi giá bậc 2, không trừ hai lần cùng một giá
 * (NFR-REL-02). Không cần khoá nào.
 */
export function buyUpgrade(id: UpgradeNodeId): void {
  updateProfile((profile) => {
    if (!canBuy(profile, id)) return profile;
    const node = UPGRADE_TREE[id];
    const level = levelOf(profile, id);
    const next: Profile = {
      ...profile,
      cores: profile.cores - node.costs[level],
      upgrades: { ...profile.upgrades, [id]: level + 1 },
    };
    if (node.effect.kind === 'unlockTower' && !next.unlockedTowers.includes(node.effect.towerId)) {
      next.unlockedTowers = [...next.unlockedTowers, node.effect.towerId];
    }
    return next;
  });
}

const BRANCH_ICON: Record<UpgradeBranch, (p: { size?: number }) => React.ReactNode> = {
  economy: IconCoin,
  damage: IconBolt,
  utility: IconDrop,
  unlock: IconLock,
};

export function WorkshopScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLocale();
  const { profile } = useProfileState();
  const [branch, setBranch] = useState<UpgradeBranch>('economy');

  const invested = UPGRADE_NODE_IDS.reduce((sum, id) => {
    const node = UPGRADE_TREE[id];
    let spent = 0;
    for (let i = 0; i < levelOf(profile, id); i++) spent += node.costs[i];
    return sum + spent;
  }, 0);

  return (
    <div className="flex h-full flex-col bg-void">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b-2 border-edge bg-panel px-4 md:h-[72px] md:px-6 lg:px-8">
        <Press onClick={onBack} aria-label={t('common.back')} className="flex w-11 items-center justify-center">
          <IconBack size={20} />
        </Press>
        <h1 className="disp text-[length:var(--text-2xl)] font-extrabold md:text-[length:var(--text-3xl)]">
          {t('workshop.title')}
        </h1>
        <div className="ml-auto">
          <Chip
            icon={<IconCore size={18} />}
            iconClassName="text-core"
            value={profile.cores}
            valueClassName="text-core"
            label={`${t('common.cores')}: ${profile.cores}`}
            size="sm"
          />
        </div>
      </header>

      {/* ≥1024: bốn nhánh cạnh nhau, thấy cả cây một lúc — MASTER.md §6 */}
      <div className="hidden min-h-0 flex-1 gap-8 overflow-y-auto p-8 lg:grid lg:grid-cols-4">
        {BRANCH_ORDER.map((b) => (
          <BranchColumn key={b} branch={b} t={t} profile={profile} />
        ))}
      </div>

      {/* <1024: bốn nhánh thành tab, mỗi nhánh một mạch dọc */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex-none px-4 pt-4 md:px-6 md:pt-6">
          <Segmented<UpgradeBranch>
            ariaLabel={t('workshop.title')}
            value={branch}
            onChange={setBranch}
            options={BRANCH_ORDER.map((b) => ({
              value: b,
              label: t(`workshop.branch.${b}` as StringKey),
            }))}
            cellClassName="!text-[length:var(--text-sm)] md:!text-[length:var(--text-md)]"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <NodeSpine branch={branch} t={t} profile={profile} />
        </div>
      </div>

      <footer className="flex flex-none flex-col gap-1.5 px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
        <p className="flex items-center gap-2 text-[length:var(--text-sm)] text-dim">
          <span className="text-core" aria-hidden><IconCore size={16} /></span>
          {t('workshop.invested', { n: invested, total: TOTAL_TREE_COST })}
        </p>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-dim">{t('workshop.coresHint')}</p>
      </footer>
    </div>
  );
}

function BranchColumn({
  branch, t, profile,
}: { branch: UpgradeBranch; t: Translate; profile: Profile }) {
  const Glyph = BRANCH_ICON[branch];
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="flex items-center gap-2.5 border-b-2 border-edge pb-3">
        {/* Icon nhãn phân loại dùng --ui-dim, KHÔNG dùng màu semantic: đỏ đã
            thuộc về "đang mất máu" — MASTER.md §8. */}
        <span className="text-dim" aria-hidden><Glyph size={20} /></span>
        <span className="disp text-[length:var(--text-xl2)] font-extrabold">
          {t(`workshop.branch.${branch}` as StringKey)}
        </span>
      </h2>
      <NodeSpine branch={branch} t={t} profile={profile} />
    </section>
  );
}

/**
 * Một nhánh vẽ thành mạch dọc. Xương sống `●─│─○` MÃ HOÁ quan hệ phụ thuộc —
 * `●` đã mở, `○` còn khoá, và đường nối cho biết cái nào chặn cái nào. Đó là
 * thông tin, không phải trang trí.
 */
function NodeSpine({
  branch, t, profile,
}: { branch: UpgradeBranch; t: Translate; profile: Profile }) {
  const nodes = nodesInBranch(branch);
  return (
    <ol className="flex flex-col">
      {nodes.map((node, index) => (
        <NodeRow
          key={node.id}
          node={node}
          t={t}
          profile={profile}
          last={index === nodes.length - 1}
        />
      ))}
    </ol>
  );
}

function NodeRow({
  node, t, profile, last,
}: { node: UpgradeNode; t: Translate; profile: Profile; last: boolean }) {
  const level = levelOf(profile, node.id);
  const blocked = unmetPrereq(profile, node);
  const maxed = level >= node.maxLevel;
  const cost = maxed ? null : node.costs[level];
  const affordable = cost !== null && profile.cores >= cost;
  const buyable = !blocked && !maxed && affordable;

  return (
    <li className="relative flex gap-3 pb-5">
      {!last && (
        <span
          aria-hidden
          className={`absolute left-[6.5px] top-4 bottom-0 w-[3px] ${blocked ? 'bg-sunken' : 'bg-core/60'}`}
        />
      )}
      <span
        aria-hidden
        className={`mt-1 h-4 w-4 flex-none rounded-full border-[3px] ${
          blocked ? 'border-dim bg-void' : 'border-edge bg-core'
        }`}
      />
      <div className="-mt-0.5 flex flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <span className={`disp text-[length:var(--text-md)] font-bold ${blocked ? 'text-dim' : 'text-ink'}`}>
            {t(`upgrade.${node.id}` as StringKey)}
          </span>
          <span className="num ml-auto text-[length:var(--text-sm)] font-semibold text-dim">
            {blocked
              ? t('workshop.locked')
              : maxed
                ? t('workshop.maxed')
                : t('tower.levelOf', { level, max: node.maxLevel })}
          </span>
        </div>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-dim">
          {t(`upgrade.${node.id}.desc` as StringKey)}
        </p>

        {blocked ? (
          <p className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-dim">
            <IconLock size={15} aria-hidden />
            {t('workshop.needs', {
              node: t(`upgrade.${blocked.id}` as StringKey),
              level: blocked.level,
            })}
          </p>
        ) : maxed ? null : (
          <Press
            variant="sunken"
            disabled={!buyable}
            onClick={() => buyUpgrade(node.id)}
            className="disp inline-flex w-fit items-center gap-2 px-4 text-[length:var(--text-md)] font-bold"
          >
            {t('workshop.upgrade')}
            <span className="text-core" aria-hidden><IconCore size={16} /></span>
            <span className="num text-core">{cost}</span>
          </Press>
        )}
      </div>
    </li>
  );
}
