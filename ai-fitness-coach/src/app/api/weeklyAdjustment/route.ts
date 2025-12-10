import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestWeeklyAdjustment } from "@/lib/ai/huggingface";
import { WeeklyPlan } from "@/types";

const difficultyWeights: Record<string, number> = {
  easy: -1,
  medium: 0,
  hard: 1,
};

const adjustPlanVolume = (plan: WeeklyPlan, delta: number): WeeklyPlan => {
  if (delta === 0) return plan;

  return {
    days: plan.days.map((day, index) => ({
      ...day,
      exercises: day.exercises.map((exercise, idx) =>
        idx < 2 + index % 2
          ? {
              ...exercise,
              sets: Math.max(1, exercise.sets + delta),
            }
          : exercise
      ),
    })),
  };
};

const parseTextAdjustment = (payload: unknown) => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const chunk = payload.find((item) => typeof item?.generated_text === "string");
    return chunk?.generated_text ?? null;
  }
  if (typeof payload === "object" && "message" in (payload as Record<string, unknown>)) {
    return String((payload as Record<string, unknown>).message);
  }
  return null;
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

  const body = await req.json();
  const inputLogs = body?.logs ?? [];

  const { data: storedLogs } = await supabase
    .from("workout_logs")
    .select("log_json")
    .eq("user_id", user.id)
    .gte("workout_date", body?.from ?? body?.startDate ?? null)
    .order("workout_date", { ascending: false })
    .limit(20);

  const allLogs = [...inputLogs, ...(storedLogs ?? []).map((row) => row.log_json ?? [])].flat();
  const difficulties = allLogs
    .map((set: Record<string, unknown>) => String(set.difficulty ?? "medium"))
    .filter(Boolean);

  const score = difficulties.reduce((acc, level) => acc + (difficultyWeights[level] ?? 0), 0);
  const volumeDelta = score <= -3 ? 1 : score >= 3 ? -1 : 0;

  const { data: planRecord, error: planError } = await supabase
    .from("workout_plan")
    .select("id, plan_json")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (planError || !planRecord?.plan_json) {
    return NextResponse.json({ error: "No plan found. Generate one first." }, { status: 400 });
  }

  const updatedPlan = adjustPlanVolume(planRecord.plan_json as WeeklyPlan, volumeDelta);

  const prompt = `Athlete logs: ${JSON.stringify(allLogs).slice(0, 4000)}\nCurrent plan: ${JSON.stringify(
    planRecord.plan_json
  ).slice(0, 4000)}\nReturn concise micro-adjustments (JSON text).`;
  const aiNotes = parseTextAdjustment(await requestWeeklyAdjustment(prompt));

  const adjustments = [
    volumeDelta > 0 && "Add one set to priority lifts for progressive overload.",
    volumeDelta < 0 && "Reduce top sets to manage fatigue.",
    score >= 5 && "Suggest deload week emphasis.",
    score <= -5 && "Athlete handling volume well; consider weight bumps.",
  ].filter(Boolean) as string[];

  const { error: updateError } = await supabase.from("workout_plan").update({
    plan_json: updatedPlan,
  }).eq("id", planRecord.id);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }

  return NextResponse.json({
    adjustments,
    aiNotes,
    difficultyScore: score,
    plan: updatedPlan,
  });
}
