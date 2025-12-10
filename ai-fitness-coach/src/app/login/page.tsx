import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row">
      <div className="w-full text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Log into your PulseForge training HQ
        </h1>
        <p className="mt-4 text-slate-300">
          Pick up where you left off, continue your streak, and let our AI coach
          adjust the next block for you.
        </p>
      </div>
      <div className="glass-panel w-full max-w-md">
        <AuthForm variant="login" />
        <p className="mt-4 text-center text-sm text-slate-300">
          Need a password reset? <a className="text-emerald-300" href="/reset-password">Reset it here</a>
        </p>
        <p className="mt-2 text-center text-sm text-slate-300">
          New athlete? <a className="text-emerald-300" href="/signup">Create a free account</a>
        </p>
      </div>
    </section>
  );
}
