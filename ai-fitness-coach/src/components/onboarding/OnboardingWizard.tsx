"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { AvatarMetrics, OnboardingData, WeeklyPlan } from "@/types";
import { StepIndicator } from "./StepIndicator";
import { AvatarPreview } from "./AvatarPreview";
import { sampleWeeklyPlan } from "@/data/samplePlan";

const totalSteps = 7;

const defaultAvatar: AvatarMetrics = {
  shoulder: "medium",
  waist: "average",
  muscle: "athletic",
};

const initialState: OnboardingData = {
  age: 28,
  heightCm: 178,
  weightKg: 78,
  gender: "male",
  goals: { shortTerm: "Recomp", longTerm: "Hybrid athlete", targetPhysique: "Athletic" },
  logistics: { daysPerWeek: 5, sessionLength: 70, environment: "gym", equipment: ["Barbell", "Dumbbells"] },
  lifestyle: { sleepHours: 7, stressLevel: "moderate", stepsPerDay: 9000 },
  avatar: defaultAvatar,
};

export const OnboardingWizard = () => {
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<OnboardingData>(initialState);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNext = (event?: FormEvent) => {
    event?.preventDefault();
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleChange = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = <K extends keyof OnboardingData, T extends keyof NonNullable<OnboardingData[K]>>(
    key: K,
    nestedKey: T,
    value: NonNullable<OnboardingData[K]>[T],
  ) => {
    setFormState((prev) => {
      const current = ((prev[key] as Record<string, unknown>) ?? {}) as Record<string, unknown>;
      return {
        ...prev,
        [key]: {
          ...current,
          [nestedKey]: value,
        },
      };
    });
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/photos/upload", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Failed to upload photo");
      return;
    }

    setPhotoPath(payload.path);
    handleChange("bodyPhoto", payload.path);
    setMessage(payload.warning ?? "Photo uploaded securely.");
  };

  const handleGenerate = () => {
    startTransition(async () => {
      setStatus("loading");
      setMessage(null);

      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formState, bodyPhoto: photoPath }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to save onboarding data");
        }

        setPlan(payload.plan ?? sampleWeeklyPlan);
        setStatus("success");
        setMessage("Plan saved. Head to the plan or dashboard pages.");
      } catch (error) {
        setStatus("error");
        setMessage((error as Error).message);
        setPlan(sampleWeeklyPlan);
      }
    });
  };

  const summaryList = useMemo(() => {
    return [
      `Training ${formState.logistics?.daysPerWeek ?? 0}x per week for ${formState.logistics?.sessionLength} minutes`,
      `Environment: ${formState.logistics?.environment} with ${formState.logistics?.equipment?.join(", ")}`,
      `Goals: ${formState.goals.shortTerm} → ${formState.goals.longTerm}`,
    ];
  }, [formState]);

  const StepOne = (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          Age
          <input
            type="number"
            value={formState.age ?? ""}
            onChange={(event) => handleChange("age", Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          Gender
          <select
            value={formState.gender}
            onChange={(event) => handleChange("gender", event.target.value as OnboardingData["gender"]) }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          Height (cm)
          <input
            type="number"
            value={formState.heightCm ?? ""}
            onChange={(event) => handleChange("heightCm", Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          Weight (kg)
          <input
            type="number"
            value={formState.weightKg ?? ""}
            onChange={(event) => handleChange("weightKg", Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
      </div>
      <label className="space-y-2 text-sm">
        Optional body photo (secure storage)
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-10 text-center"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handlePhotoUpload(file);
          }}
        />
      </label>
    </div>
  );

  const StepTwo = (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <label className="space-y-1 text-sm">
          Shoulder width
          <select
            value={formState.avatar?.shoulder ?? "medium"}
            onChange={(event) => handleNestedChange("avatar", "shoulder", event.target.value as AvatarMetrics["shoulder"])}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="wide">Wide</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Wrist size
          <select
            value={formState.wristSize ?? "medium"}
            onChange={(event) => handleChange("wristSize", event.target.value as "small" | "medium" | "large")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Body type
          <select
            value={formState.bodyType ?? "meso"}
            onChange={(event) => handleChange("bodyType", event.target.value as typeof formState.bodyType)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <option value="ecto">Ectomorph</option>
            <option value="meso">Mesomorph</option>
            <option value="endo">Endomorph</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Injuries or limitations
          <textarea
            value={formState.injuries ?? ""}
            onChange={(event) => handleChange("injuries", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
      </div>
      <AvatarPreview metrics={formState.avatar ?? defaultAvatar} />
    </div>
  );

  const StepThree = (
    <div className="space-y-4">
      <label className="space-y-1 text-sm">
        Short-term goal
        <input
          value={formState.goals.shortTerm}
          onChange={(event) => handleNestedChange("goals", "shortTerm", event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
      <label className="space-y-1 text-sm">
        Long-term goal
        <input
          value={formState.goals.longTerm}
          onChange={(event) => handleNestedChange("goals", "longTerm", event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
      <label className="space-y-1 text-sm">
        Target physique reference (text or URL)
        <input
          value={formState.goals.targetPhysique ?? ""}
          onChange={(event) => handleNestedChange("goals", "targetPhysique", event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
    </div>
  );

  const StepFour = (
    <div className="space-y-4">
      <label className="space-y-1 text-sm">
        Days per week
        <input
          type="range"
          min={2}
          max={6}
          value={formState.logistics?.daysPerWeek ?? 4}
          onChange={(event) => handleNestedChange("logistics", "daysPerWeek", Number(event.target.value))}
          className="w-full"
        />
        <span className="text-slate-300">
          {formState.logistics?.daysPerWeek ?? 4} training days
        </span>
      </label>
      <label className="space-y-1 text-sm">
        Time per session (minutes)
        <input
          type="number"
          value={formState.logistics?.sessionLength ?? 60}
          onChange={(event) => handleNestedChange("logistics", "sessionLength", Number(event.target.value))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
      <label className="space-y-1 text-sm">
        Training environment
        <div className="flex gap-4">
          {["gym", "home"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleNestedChange("logistics", "environment", option as "gym" | "home")}
              className={`rounded-full border px-4 py-2 text-sm ${
                formState.logistics?.environment === option
                  ? "border-emerald-400 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </label>
      <label className="space-y-1 text-sm">
        Equipment list (comma separated)
        <input
          value={formState.logistics?.equipment?.join(", ") ?? ""}
          onChange={(event) =>
            handleNestedChange(
              "logistics",
              "equipment",
              event.target.value.split(",").map((item) => item.trim())
            )
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
    </div>
  );

  const StepFive = (
    <div className="grid gap-4 md:grid-cols-2">
      {["bench", "squat", "deadlift", "press"].map((lift) => (
        <label key={lift} className="space-y-1 text-sm">
          {lift.toUpperCase()} (kg)
          <input
            type="number"
            onChange={(event) =>
              handleNestedChange(
                "strength",
                lift as keyof NonNullable<OnboardingData["strength"]>,
                Number(event.target.value)
              )
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
      ))}
      <p className="text-sm text-slate-400 md:col-span-2">
        Unsure? Leave fields blank and we will estimate based on training age.
      </p>
    </div>
  );

  const StepSix = (
    <div className="grid gap-4 md:grid-cols-3">
      <label className="space-y-1 text-sm">
        Sleep (hours)
        <input
          type="number"
          value={formState.lifestyle?.sleepHours ?? 7}
          onChange={(event) => handleNestedChange("lifestyle", "sleepHours", Number(event.target.value))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
      <label className="space-y-1 text-sm">
        Stress
        <select
          value={formState.lifestyle?.stressLevel ?? "moderate"}
          onChange={(event) =>
            handleNestedChange("lifestyle", "stressLevel", event.target.value as "low" | "moderate" | "high")
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">
        Daily steps
        <input
          type="number"
          value={formState.lifestyle?.stepsPerDay ?? 8000}
          onChange={(event) => handleNestedChange("lifestyle", "stepsPerDay", Number(event.target.value))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        />
      </label>
    </div>
  );

  const StepSeven = (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Review + generate plan</h3>
      <ul className="space-y-2 text-slate-300">
        {summaryList.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Generating..." : "Generate my plan"}
      </button>
      {status === "success" && plan && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-semibold text-emerald-200">
            Weekly plan preview ({plan.days.length} days)
          </p>
          <ul className="mt-2 space-y-1 text-emerald-100">
            {plan.days.map((day) => (
              <li key={day.name}>
                {day.name}: {day.exercises.length} exercises
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const stepsContent = [
    StepOne,
    StepTwo,
    StepThree,
    StepFour,
    StepFive,
    StepSix,
    StepSeven,
  ];

  return (
    <div className="glass-panel space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Guided onboarding
        </p>
        <h2 className="mt-2 text-2xl font-semibold">7 steps to laser-focused programming</h2>
      </div>
      <StepIndicator total={totalSteps} current={step} />
      <form className="space-y-6" onSubmit={handleNext}>
        {stepsContent[step]}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="rounded-full border border-white/20 px-6 py-2 text-sm disabled:opacity-40"
          >
            Back
          </button>
          {step < totalSteps - 1 && (
            <button type="submit" className="rounded-full bg-white/15 px-6 py-2 text-sm">
              Next step
            </button>
          )}
        </div>
      </form>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
          {message}
        </p>
      )}
    </div>
  );
};
