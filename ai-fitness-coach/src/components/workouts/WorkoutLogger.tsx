"use client";

import { useState } from "react";
import type { WorkoutExercise } from "@/types";

interface WorkoutLoggerProps {
  date: string;
  exercise: WorkoutExercise;
}

interface LoggedSet {
  set: number;
  reps: number;
  weight: number;
  difficulty: "easy" | "medium" | "hard";
}

export const WorkoutLogger = ({ date, exercise }: WorkoutLoggerProps) => {
  const [entries, setEntries] = useState<LoggedSet[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const addSet = () => {
    setEntries((prev) => [
      ...prev,
      { set: prev.length + 1, reps: Number(exercise.reps), weight: 0, difficulty: "medium" },
    ]);
  };

  const updateEntry = (index: number, field: keyof LoggedSet, value: string) => {
    setEntries((prev) =>
      prev.map((entry, idx) => (idx === index ? { ...entry, [field]: field === "difficulty" ? value : Number(value) } : entry))
    );
  };

  const saveLog = async () => {
    const response = await fetch("/api/workouts/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, exercise, entries }),
    });

    const payload = await response.json();
    setMessage(payload.message ?? payload.error ?? "Saved");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{exercise.name}</p>
          <p className="text-xs text-slate-500">Target: {exercise.sets}×{exercise.reps}</p>
        </div>
        <button
          type="button"
          onClick={addSet}
          className="rounded-full border border-white/20 px-3 py-1 text-xs"
        >
          Add set
        </button>
      </div>
      {entries.length === 0 && (
        <p className="text-xs text-slate-400">No sets logged yet.</p>
      )}
      {entries.map((entry, index) => (
        <div key={`set-${entry.set}`} className="grid gap-2 text-sm md:grid-cols-4">
          <label>
            Reps
            <input
              type="number"
              value={entry.reps}
              onChange={(event) => updateEntry(index, "reps", event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              value={entry.weight}
              onChange={(event) => updateEntry(index, "weight", event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
            />
          </label>
          <label>
            Difficulty
            <select
              value={entry.difficulty}
              onChange={(event) => updateEntry(index, "difficulty", event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Notes
            <input
              type="text"
              placeholder="optional"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={saveLog}
        className="w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-slate-950"
      >
        Save workout log
      </button>
      {message && <p className="text-center text-xs text-slate-400">{message}</p>}
    </div>
  );
};
