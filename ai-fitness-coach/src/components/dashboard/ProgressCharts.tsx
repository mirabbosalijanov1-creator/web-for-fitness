"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { WorkoutLogRow } from "@/types";

interface WeightRow {
  progress_date: string;
  weight_kg: number;
  strength_json: { bench?: number; squat?: number } | null;
}

const groupVolume = (logs: WorkoutLogRow[]) => {
  const totals: Record<string, number> = {};
  logs.forEach((log) => {
    const group = log.log_json.exercise?.name?.split(" ")[0] ?? "Full";
    const sets = log.log_json.entries?.length ?? 0;
    totals[group] = (totals[group] ?? 0) + sets;
  });
  return Object.entries(totals).map(([group, volume]) => ({ group, volume }));
};

export const ProgressCharts = () => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [weights, setWeights] = useState<WeightRow[]>([]);
  const [volume, setVolume] = useState<Array<{ group: string; volume: number }>>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    const fetchData = async () => {
      setState("loading");
      try {
        const [{ data: weightsData, error: weightError }, { data: logsData, error: logsError }] =
          await Promise.all([
            supabase
              .from("progress")
              .select("progress_date, weight_kg, strength_json")
              .order("progress_date", { ascending: true })
              .limit(12),
            supabase
              .from("workout_logs")
              .select("log_json")
              .order("workout_date", { ascending: false })
              .limit(50),
          ]);

        if (weightError || logsError) {
          throw weightError ?? logsError;
        }

        setWeights(weightsData ?? []);
        setVolume(groupVolume((logsData ?? []) as WorkoutLogRow[]));
        setState("ready");
      } catch (error) {
        console.error(error);
        setState("error");
      }
    };

    fetchData();
  }, [supabase]);

  if (state === "loading") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-slate-300">
        Loading progress metrics...
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
        Could not load progress data.
      </div>
    );
  }

  const weightData = weights.map((row) => ({
    date: row.progress_date,
    weight: row.weight_kg,
  }));

  const oneRmData = weights.map((row) => ({
    date: row.progress_date,
    bench: row.strength_json?.bench,
    squat: row.strength_json?.squat,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-300">Bodyweight trend</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "none" }} />
              <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-300">Estimated 1RM</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={oneRmData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "none" }} />
              <Line type="monotone" dataKey="bench" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="squat" stroke="#f472b6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-4 lg:col-span-2">
        <p className="text-sm text-slate-300">Weekly volume per muscle group (sets)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="group" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "none" }} />
              <Bar dataKey="volume" fill="#34d399" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
