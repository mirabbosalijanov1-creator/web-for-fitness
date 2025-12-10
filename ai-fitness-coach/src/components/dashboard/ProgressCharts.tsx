"use client";

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

const weightData = [
  { date: "Week 1", weight: 82 },
  { date: "Week 2", weight: 81.2 },
  { date: "Week 3", weight: 80.8 },
  { date: "Week 4", weight: 80.2 },
];

const oneRmData = [
  { date: "Week 1", bench: 110, squat: 150 },
  { date: "Week 2", bench: 112, squat: 152 },
  { date: "Week 3", bench: 113, squat: 155 },
  { date: "Week 4", bench: 115, squat: 158 },
];

const volumeData = [
  { group: "Chest", volume: 48 },
  { group: "Back", volume: 52 },
  { group: "Legs", volume: 60 },
  { group: "Shoulders", volume: 36 },
];

export const ProgressCharts = () => (
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
          <BarChart data={volumeData}>
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
