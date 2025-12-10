const tiers = [
  { level: 1, xp: 0 },
  { level: 2, xp: 500 },
  { level: 3, xp: 1500 },
  { level: 4, xp: 3000 },
];

export const XPCard = ({ level = 3, totalXp = 1875 }: { level?: number; totalXp?: number }) => {
  const nextTier = tiers.find((tier) => tier.level === level + 1) ?? tiers[tiers.length - 1];
  const currentTier = tiers.find((tier) => tier.level === level) ?? tiers[0];
  const progress = Math.min(
    100,
    ((totalXp - currentTier.xp) / (nextTier.xp - currentTier.xp)) * 100
  );

  return (
    <div className="rounded-3xl border border-emerald-400/40 bg-emerald-500/10 p-6 text-slate-100">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">XP system</p>
      <h3 className="mt-2 text-3xl font-semibold text-white">Level {level}</h3>
      <p className="text-sm text-emerald-100">{totalXp} XP · Next reward at {nextTier.xp} XP</p>
      <div className="mt-4 h-2 w-full rounded-full bg-emerald-900/40">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
