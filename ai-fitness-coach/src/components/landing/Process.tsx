const steps = [
  {
    title: "Enter your data",
    detail:
      "A friendly 7-step wizard captures lifestyle, strength, logistics, and optional photos stored privately in Supabase Storage.",
  },
  {
    title: "AI builds the plan",
    detail:
      "We send your JSON profile to free HuggingFace inference endpoints, then store the structured week in Supabase.",
  },
  {
    title: "Track and adapt",
    detail:
      "Each workout page logs sets, weights, and RPE. Weekly + monthly prompts tweak the next block automatically.",
  },
];

export const Process = () => (
  <section id="process" className="mx-auto max-w-6xl px-6 py-16">
    <p className="text-center text-sm uppercase tracking-[0.3em] text-emerald-300">
      3-step system
    </p>
    <h2 className="mt-3 text-center text-3xl font-semibold">
      From onboarding to adaptive training in minutes
    </h2>
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step.title} className="glass-panel h-full">
          <div className="text-sm font-semibold text-emerald-300">
            Step {index + 1}
          </div>
          <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
          <p className="mt-4 text-slate-300">{step.detail}</p>
        </div>
      ))}
    </div>
  </section>
);
