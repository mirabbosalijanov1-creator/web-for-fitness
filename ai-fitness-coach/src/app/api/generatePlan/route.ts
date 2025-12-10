import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestWeeklyPlan } from "@/lib/ai/huggingface";
import { sampleWeeklyPlan } from "@/data/samplePlan";
import type { WeeklyPlan } from "@/types";

const stringifyProfile = (profile: Record<string, unknown>) => {
  return Object.entries(profile)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
};

const parsePlanResponse = (raw: unknown): WeeklyPlan | null => {
  if (!raw) return null;

  const tryParse = (text: string) => {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const jsonString = text.slice(start, end + 1);
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  if (typeof raw === "string") {
    return tryParse(raw);
  }

  if (Array.isArray(raw)) {
    for (const chunk of raw) {
      if (typeof chunk?.generated_text === "string") {
        const parsed = tryParse(chunk.generated_text);
        if (parsed) return parsed;
      }
    }
  }

  if (typeof raw === "object" && raw !== null) {
    return raw as WeeklyPlan;
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

  const { body } = await req.json().catch(() => ({ body: null }));

  const { data: profileData, error: profileError } = await supabase
    .from("user_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profileData) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const prompt = `Create a JSON workout plan with 6 days for this athlete. Keep schema {\"days\":[{\"name\":\"\",\"focus\":\"\",\"exercises\":[{\"name\":\"\",\"sets\":0,\"reps\":\"\",\"rest\":\"\",\"cues\":\"\"}]}]}\nAthlete profile:\n${stringifyProfile({
    ...profileData,
    extraContext: body,
  })}`;

  const aiResponse = await requestWeeklyPlan(prompt);
  const plan = parsePlanResponse(aiResponse) ?? sampleWeeklyPlan;

  const { error: planError } = await supabase.from("workout_plan").insert({
    user_id: user.id,
    plan_json: plan,
  });

  if (planError) {
    console.error(planError);
    return NextResponse.json({ error: "Failed to save generated plan" }, { status: 500 });
  }

  return NextResponse.json({ plan, source: aiResponse ? "huggingface" : "sample" });
}
