const features = [
  {
    title: "Supabase-first security",
    detail: "Row-Level Security is enabled for every table and photos live in a private bucket with signed URLs.",
  },
  {
    title: "Avatar visualization",
    detail: "A simple SVG silhouette widens shoulders or narrows waist based on your onboarding sliders.",
  },
  {
    title: "XP + streaks",
    detail: "Keep motivation high with XP levels, streak counters, and celebratory confetti when you log workouts.",
  },
  {
    title: "Admin analytics",
    detail: "An internal admin surface shows aggregated onboarding stats, plan counts, and storage usage.",
  },
];

export const FeatureGrid = () => (
  <section className="mx-auto max-w-6xl px-6 py-16">
    <div className="grid gap-6 md:grid-cols-2">
      {features.map((feature) => (
        <div key={feature.title} className="glass-panel">
          <h3 className="text-xl font-semibold">{feature.title}</h3>
          <p className="mt-3 text-slate-300">{feature.detail}</p>
        </div>
      ))}
    </div>
  </section>
);
