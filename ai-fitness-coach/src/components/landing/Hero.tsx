import Link from "next/link";

export const Hero = () => (
  <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-16 pt-12 text-center md:flex-row md:text-left">
    <div className="flex-1 space-y-6">
      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
        AI + Human-anchored fitness
      </p>
      <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
        Free AI-powered fitness coaching that adapts every single week.
      </h1>
      <p className="text-lg text-slate-300">
        Upload your stats once. Our onboarding wizard captures 40+ data points,
        lets a free HuggingFace model build your training, and Supabase keeps
        everything secure.
      </p>
      <div className="flex flex-col gap-4 text-sm md:flex-row">
        <Link
          href="/signup"
          className="rounded-full bg-emerald-500 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Start for free
        </Link>
        <Link
          href="#process"
          className="rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white/80 transition hover:border-white/60"
        >
          See the 3-step flow
        </Link>
      </div>
      <div className="flex gap-6 text-sm text-slate-400">
        <div>
          <p className="text-3xl font-semibold text-white">40+</p>
          <p>data points captured in onboarding</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-white">6-day</p>
          <p>weekly plans with instant edits</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-white">24/7</p>
          <p>access to your AI coach</p>
        </div>
      </div>
    </div>
    <div className="flex-1">
      <div className="glass-panel grid-bg">
        <p className="text-sm text-slate-300">Weekly preview</p>
        <h3 className="mt-2 text-xl font-semibold">Hybrid push + athletic lower</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {[
            "AI assigns deloads when your difficulty logs trend high",
            "XP + streaks gamify showing up",
            "Avatar silhouette transforms with your measurements",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
