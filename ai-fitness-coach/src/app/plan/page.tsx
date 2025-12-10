'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WeeklyPlanBoard } from "@/components/workouts/WeeklyPlanBoard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { WeeklyPlan } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

type FetchState = "idle" | "loading" | "error" | "empty" | "success";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function PlanPage() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const toast = useToastStore((state) => state.trigger);

  const fetchPlan = useCallback(async () => {
    setState("loading");
    setError(null);

    const { data, error: planError } = await supabase
      .from("workout_plan")
      .select("plan_json")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      console.error(planError);
      setState("error");
      setError(planError.message);
      toast(planError.message ?? "Unable to load plan", "error");
      return;
    }

    if (!data?.plan_json) {
      setState("empty");
      return;
    }

    setPlan(data.plan_json as WeeklyPlan);
    setState("success");
  }, [supabase]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan, refreshIndex]);

  const handleRetry = () => setRefreshIndex((prev) => prev + 1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generatePlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to generate plan");
      toast("New plan generated", "success");
      setRefreshIndex((prev) => prev + 1);
    } catch (generateError) {
      const errMsg = (generateError as Error).message;
      setError(errMsg);
      toast(errMsg, "error");
      setState("error");
    } finally {
      setIsGenerating(false);
    }
  };

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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:border-white/60 disabled:opacity-50"
            disabled={state === "loading" || isGenerating}
          >
            {state === "loading" ? "Refreshing..." : "Refresh plan"}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate plan"}
          </button>
        </div>
      </div>

      {state === "loading" && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          Fetching your plan...
        </div>
      )}

      {state === "error" && (
        <div className="mt-12 rounded-3xl border border-rose-400/40 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
          Could not load your plan: {error}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full border border-rose-200/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {state === "empty" && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No plan yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Complete onboarding or generate a plan to unlock your weekly schedule.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 md:flex-row md:justify-center">
            <Link
              href="/onboarding"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-900"
            >
              Run onboarding wizard
            </Link>
            <button
              type="button"
              onClick={() => setRefreshIndex((prev) => prev + 1)}
              className="rounded-full border border-white/20 px-5 py-2 text-sm text-white"
            >
              Check again
            </button>
          </div>
        </div>
      )}

      {state === "success" && plan && (
        <>
          <div className="mt-10">
            <WeeklyPlanBoard plan={plan} />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plan.days.map((day) => (
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
        </>
      )}
    </section>
  );
}
