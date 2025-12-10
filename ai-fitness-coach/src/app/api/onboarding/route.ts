import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sampleWeeklyPlan } from "@/data/samplePlan";

const goalsSchema = z.object({
  shortTerm: z.string().min(3),
  longTerm: z.string().min(3),
  targetPhysique: z.string().optional(),
});

const logisticsSchema = z.object({
  daysPerWeek: z.number().int().min(2).max(7),
  sessionLength: z.number().int().min(20).max(150),
  environment: z.enum(["gym", "home"]),
  equipment: z.array(z.string().min(1)).default([]),
});

const lifestyleSchema = z
  .object({
    sleepHours: z.number().min(3).max(12).optional(),
    stressLevel: z.enum(["low", "moderate", "high"]).optional(),
    stepsPerDay: z.number().int().min(0).max(50000).optional(),
  })
  .optional();

const strengthSchema = z
  .object({
    bench: z.number().min(0).max(400).optional(),
    squat: z.number().min(0).max(450).optional(),
    deadlift: z.number().min(0).max(500).optional(),
    press: z.number().min(0).max(250).optional(),
  })
  .optional();

const avatarSchema = z
  .object({
    shoulder: z.enum(["small", "medium", "wide"]).optional(),
    waist: z.enum(["tight", "average", "blocky"]).optional(),
    muscle: z.enum(["lean", "athletic", "massive"]).optional(),
  })
  .optional();

const onboardingSchema = z.object({
  age: z.number().int().min(12).max(80).optional(),
  gender: z.enum(["male", "female", "non-binary", "prefer_not_to_say"]).optional(),
  heightCm: z.number().min(100).max(230).optional(),
  weightKg: z.number().min(35).max(250).optional(),
  bodyPhoto: z.string().optional(),
  shoulderWidth: z.enum(["small", "medium", "wide"]).optional(),
  wristSize: z.enum(["small", "medium", "large"]).optional(),
  injuries: z.string().optional(),
  bodyType: z.enum(["ecto", "meso", "endo"]).optional(),
  goals: goalsSchema,
  logistics: logisticsSchema,
  strength: strengthSchema,
  lifestyle: lifestyleSchema,
  avatar: avatarSchema,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = onboardingSchema.parse(await req.json());

    const profilePayload = {
      user_id: user.id,
      age: payload.age,
      gender: payload.gender,
      height_cm: payload.heightCm,
      weight_kg: payload.weightKg,
      shoulder_width: payload.shoulderWidth ?? payload.avatar?.shoulder,
      wrist_size: payload.wristSize,
      injuries: payload.injuries,
      body_type: payload.bodyType,
      short_term_goal: payload.goals.shortTerm,
      long_term_goal: payload.goals.longTerm,
      target_physique: payload.goals.targetPhysique,
      training_days_per_week: payload.logistics.daysPerWeek,
      session_duration_minutes: payload.logistics.sessionLength,
      training_environment: payload.logistics.environment,
      equipment: payload.logistics.equipment,
      bench_kg: payload.strength?.bench,
      squat_kg: payload.strength?.squat,
      deadlift_kg: payload.strength?.deadlift,
      press_kg: payload.strength?.press,
      sleep_hours: payload.lifestyle?.sleepHours,
      stress_level: payload.lifestyle?.stressLevel,
      steps_per_day: payload.lifestyle?.stepsPerDay,
      avatar_metrics: payload.avatar ?? null,
      updated_at: new Date().toISOString(),
      last_photo_id: null,
    };

    const { error: userUpsertError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
      },
      { onConflict: "id" }
    );

    if (userUpsertError) {
      console.error(userUpsertError);
      return NextResponse.json({ error: "Failed to sync user record" }, { status: 500 });
    }

    const { error: profileError } = await supabase.from("user_profile").upsert(profilePayload, {
      onConflict: "user_id",
    });

    if (profileError) {
      console.error(profileError);
      return NextResponse.json({ error: "Failed to save onboarding profile" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Onboarding saved",
      plan: sampleWeeklyPlan,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
