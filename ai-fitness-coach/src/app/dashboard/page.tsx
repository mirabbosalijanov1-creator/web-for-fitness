import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressCharts } from "@/components/dashboard/ProgressCharts";
import { AvatarPreview } from "@/components/onboarding/AvatarPreview";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: streakRow }, { data: xpRow }, { data: latestProgress }] = await Promise.all([
    supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
    supabase.from("xp").select("total_xp, level").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("progress")
      .select("weight_kg, progress_date")
      .eq("user_id", user.id)
      .order("progress_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Your performance hub</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Current streak" value={`${streakRow?.current_streak ?? 0} days`} />
            <Stat label="Longest streak" value={`${streakRow?.longest_streak ?? 0} days`} />
            <Stat label="XP" value={`${xpRow?.total_xp ?? 0} (Lvl ${xpRow?.level ?? 1})`} />
            <Stat label="Last weigh-in" value={`${latestProgress?.weight_kg ?? "--"} kg`} />
          </div>
        </div>
        <div className="w-full max-w-sm">
          <AvatarPreview autoLoadProfile title="Live avatar" />
        </div>
      </div>

      <div className="mt-10">
        <ProgressCharts />
      </div>
    </section>
  );
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </div>
);
