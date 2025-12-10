import Link from "next/link";

export const CallToAction = () => (
  <section className="mx-auto max-w-4xl px-6 pb-16">
    <div className="glass-panel text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
        Ready when you are
      </p>
      <h3 className="mt-2 text-3xl font-semibold">
        Your body data + free AI = smarter training.
      </h3>
      <p className="mt-3 text-slate-300">
        Ship shape faster with curated weekly plans, adaptive prompts, and
        privacy-friendly infrastructure built on Supabase.
      </p>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
        <Link
          href="/signup"
          className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950"
        >
          Launch onboarding wizard
        </Link>
        <Link
          href="/onboarding"
          className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white"
        >
          Preview the 7 steps
        </Link>
      </div>
    </div>
  </section>
);
