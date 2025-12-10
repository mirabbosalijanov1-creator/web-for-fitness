import { notFound } from "next/navigation";
import { sampleWeeklyPlan } from "@/data/samplePlan";
import { WorkoutLogger } from "@/components/workouts/WorkoutLogger";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function WorkoutDayPage({ params }: { params: { day: string } }) {
  const day = sampleWeeklyPlan.days.find((item) => slugify(item.name) === params.day);

  if (!day) {
    notFound();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Daily workout</p>
      <h1 className="mt-3 text-4xl font-semibold">{day.name}</h1>
      <p className="mt-2 text-slate-300">{day.focus}</p>
      <div className="mt-8 space-y-6">
        {day.exercises.map((exercise) => (
          <WorkoutLogger key={exercise.name} date={today} exercise={exercise} />
        ))}
      </div>
    </section>
  );
}
