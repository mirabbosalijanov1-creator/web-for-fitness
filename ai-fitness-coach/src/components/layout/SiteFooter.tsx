export const SiteFooter = () => (
  <footer className="border-t border-white/5 bg-slate-950/80 text-xs text-slate-400">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} PulseForge Labs. All rights reserved.</p>
      <p className="text-white/70">
        Built with Next.js, Supabase, and HuggingFace free tier models.
      </p>
    </div>
  </footer>
);
