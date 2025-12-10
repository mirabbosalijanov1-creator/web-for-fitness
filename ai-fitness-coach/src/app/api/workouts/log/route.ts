import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkoutLogPayload } from "@/types";

const entrySchema = z.object({
  set: z.number(),
  reps: z.number(),
  weight: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

const logSchema: z.ZodType<WorkoutLogPayload> = z.object({
  date: z.string(),
  workoutName: z.string().optional(),
  exercise: z
    .object({
      name: z.string(),
      sets: z.number().optional(),
      reps: z.string().optional(),
    })
    .optional(),
  entries: z.array(entrySchema),
});

const averageDifficulty = (entries: Array<{ difficulty: string }>) => {
  const values = entries.map((entry) => entry.difficulty);
  const hard = values.filter((value) => value === "hard").length;
  const easy = values.filter((value) => value === "easy").length;

  if (hard > easy) return "hard";
  if (easy > hard) return "easy";
  return "medium";
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

  const payload = logSchema.parse(await req.json());
  const difficulty = averageDifficulty(payload.entries);

  const { error: insertError } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    workout_date: payload.date,
    log_json: payload,
    difficulty,
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: "Unable to store workout log" }, { status: 500 });
  }

  const workoutDate = new Date(payload.date);
  const { data: streakRow } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  let currentStreak = 1;
  if (streakRow?.updated_at) {
    const diff = differenceInCalendarDays(workoutDate, new Date(streakRow.updated_at));
    if (diff === 0) currentStreak = streakRow.current_streak ?? 1;
    else if (diff === 1) currentStreak = (streakRow.current_streak ?? 0) + 1;
  }

  const longestStreak = Math.max(currentStreak, streakRow?.longest_streak ?? 0);

  await supabase.from("streaks").upsert({
    user_id: user.id,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    updated_at: workoutDate.toISOString(),
  });

  const xpGain = 20 + payload.entries.length * 5;
  const { data: xpRow } = await supabase.from("xp").select("total_xp, level").eq("user_id", user.id).maybeSingle();
  const totalXp = (xpRow?.total_xp ?? 0) + xpGain;
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);

  await supabase.from("xp").upsert({
    user_id: user.id,
    total_xp: totalXp,
    level,
  });

  return NextResponse.json({
    message: "Workout logged",
    difficulty,
    xpGain,
    streak: { current: currentStreak, longest: longestStreak },
    level,
  });
}
