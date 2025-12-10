import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestMonthlyEvolution } from "@/lib/ai/huggingface";
import { WeeklyPlan } from "@/types";

const rotateExercises = (plan: WeeklyPlan): WeeklyPlan => {
  return {
    days: plan.days.map((day, index) => {
      const rotated = [...day.exercises];
      if (rotated.length > 1) {
        const first = rotated.shift();
        if (first) rotated.push(first);
      }
      return {
        ...day,
        name: `${day.name.split("-")[0].trim()} - Block ${index % 2 === 0 ? "A" : "B"}`,
        exercises: rotated.map((exercise, idx) =>
          idx === 0
            ? { ...exercise, name: `${exercise.name} (variation)` }
            : exercise
        ),
      };
    }),
  };
};

const aggregateProgress = (rows: Array<Record<string, unknown>>) => {
  const weights = rows.map((row) => Number(row.weight_kg ?? row.weight)).filter(Boolean);
  const delta = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0;
  return {
    entries: rows.length,
    weightDelta: Number(delta.toFixed(1)),
  };
};

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient(cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = await req.json().catch(() => ({}));
  const since = input.since ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();

  const [{ data: planRecord }, { data: progressRows }] = await Promise.all([
    supabase
      .from("workout_plan")
      .select("id, plan_json")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("progress")
      .select("weight_kg, strength_json, progress_date")
      .eq("user_id", user.id)
      .gte("progress_date", since)
      .order("progress_date", { ascending: true }),
  ]);

  if (!planRecord?.plan_json) {
    return NextResponse.json({ error: "No plan found" }, { status: 400 });
  }

  const metrics = aggregateProgress(progressRows ?? []);
  const rotatedPlan = rotateExercises(planRecord.plan_json as WeeklyPlan);

  const prompt = `Evolve this monthly block.\nCurrent plan: ${JSON.stringify(planRecord.plan_json)}\nProgress metrics: ${JSON.stringify({
    metrics,
    input,
  })}\nRespond with concise bullet JSON describing block focus and new accessories.`;
  const aiNotes = await requestMonthlyEvolution(prompt);

  const { error: updateError } = await supabase
    .from("workout_plan")
    .update({ plan_json: rotatedPlan })
    .eq("id", planRecord.id);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: "Failed to save evolved block" }, { status: 500 });
  }

  return NextResponse.json({
    newBlock: rotatedPlan,
    metrics,
    aiNotes,
    summary: [
      metrics.weightDelta > 0
        ? "Bodyweight trending up; maintain surplus."
        : "Bodyweight flat/down; consider calorie bump.",
      "Primary lifts rotated to manage fatigue.",
    ],
  });
}
