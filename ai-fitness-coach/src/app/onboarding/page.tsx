import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.2fr_0.8fr]">
      <OnboardingWizard />
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        <h3 className="text-xl font-semibold text-white">What happens next?</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>We save your onboarding JSON securely with Row-Level Security.</li>
          <li>The AI plan route generates or refreshes a 6-day schedule.</li>
          <li>Weekly and monthly prompts watch your logs for adjustments.</li>
        </ol>
        <p className="text-slate-400">
          You can revisit this wizard anytime to re-run the AI if your goals change.
        </p>
      </aside>
    </section>
  );
}
