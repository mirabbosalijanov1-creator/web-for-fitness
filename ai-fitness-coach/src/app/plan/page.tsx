import Link from "next/link";
import { sampleWeeklyPlan } from "@/data/samplePlan";
import { WeeklyPlanBoard } from "@/components/workouts/WeeklyPlanBoard";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function PlanPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Weekly plan</p>
          <h1 className="mt-3 text-4xl font-semibold">Your 6-day hybrid split</h1>
          <p className="mt-2 text-slate-300">
            Generated via HuggingFace inference API with your onboarding data and
            stored in Supabase JSON.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="rounded-full border border-white/20 px-5 py-2 text-sm"
        >
          Regenerate plan
        </Link>
      </div>
      <div className="mt-10">
        <WeeklyPlanBoard plan={sampleWeeklyPlan} />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {sampleWeeklyPlan.days.map((day) => (
          <Link
            key={day.name}
            href={`/workouts/${slugify(day.name)}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 transition hover:border-emerald-400"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Log workout</p>
            <p className="text-lg font-semibold text-white">{day.name}</p>
            <p>{day.exercises.length} exercises</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
