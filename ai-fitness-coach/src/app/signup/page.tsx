import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row">
      <div className="w-full text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Step 1
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Create your free coaching account
        </h1>
        <p className="mt-4 text-slate-300">
          We use privacy-first Supabase auth. Once verified, jump into the 7-step
          onboarding wizard so the AI can build your plan.
        </p>
      </div>
      <div className="glass-panel w-full max-w-md">
        <AuthForm variant="signup" />
        <p className="mt-4 text-center text-sm text-slate-300">
          Already have an account? <a className="text-emerald-300" href="/login">Log in</a>
        </p>
      </div>
    </section>
  );
}
