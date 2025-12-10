import { WeeklyPlan } from "@/types";

interface WeeklyPlanBoardProps {
  plan: WeeklyPlan;
}

export const WeeklyPlanBoard = ({ plan }: WeeklyPlanBoardProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    {plan.days.map((day) => (
      <div key={day.name} className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          {day.focus ?? "Custom focus"}
        </p>
        <h3 className="mt-1 text-xl font-semibold">{day.name}</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {day.exercises.map((exercise) => (
            <li key={exercise.name} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <div>
                <p className="font-medium text-white">{exercise.name}</p>
                <p className="text-slate-300">
                  {exercise.sets} sets × {exercise.reps} · Rest {exercise.rest}
                </p>
                {exercise.cues && (
                  <p className="text-xs text-slate-400">Cue: {exercise.cues}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
