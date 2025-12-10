import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const isAdmin = (email: string | undefined | null) => {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase());
  return admins.filter(Boolean).includes(email.toLowerCase());
};

const formatNumber = (value: number | null | undefined) =>
  value !== null && value !== undefined ? value.toLocaleString() : "0";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect("/login");
  }

  const [{ count: totalUsers }, { count: totalLogs }, { data: streakRows }, { data: xpRows }, { data: goalRows }] =
    await Promise.all([
      supabase.from("users").select("id", { head: true, count: "exact" }),
      supabase.from("workout_logs").select("id", { head: true, count: "exact" }),
      supabase.from("streaks").select("current_streak"),
      supabase.from("xp").select("total_xp"),
      supabase.from("user_profile").select("short_term_goal"),
    ]);

  const avgStreak =
    streakRows && streakRows.length
      ? streakRows.reduce((sum, row) => sum + (row.current_streak ?? 0), 0) / streakRows.length
      : 0;

  const avgXp =
    xpRows && xpRows.length
      ? xpRows.reduce((sum, row) => sum + (row.total_xp ?? 0), 0) / xpRows.length
      : 0;

  const goalCounts =
    goalRows?.reduce<Record<string, number>>((acc, row) => {
      const goal = row.short_term_goal ?? "Not set";
      acc[goal] = (acc[goal] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  const topGoals = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Admin</p>
          <h1 className="mt-2 text-4xl font-semibold">Analytics dashboard</h1>
          <p className="text-slate-400">High-level view of member progress and usage.</p>
        </div>
        <p className="text-sm text-slate-400">Signed in as {user.email}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={formatNumber(totalUsers)} />
        <StatCard label="Workout logs" value={formatNumber(totalLogs)} />
        <StatCard label="Avg streak (days)" value={avgStreak.toFixed(1)} />
        <StatCard label="Avg XP" value={Math.round(avgXp).toLocaleString()} />
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Goal trends</h2>
        <p className="text-sm text-slate-400">Top short-term goals reported in onboarding.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {topGoals.length === 0 && <li className="text-slate-400">No goal data yet.</li>}
          {topGoals.map(([goal, count]) => (
            <li key={goal} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
              <span>{goal}</span>
              <span className="text-emerald-300">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </div>
);
