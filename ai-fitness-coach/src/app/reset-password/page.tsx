import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Account help
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Send a reset link</h1>
        <p className="mt-4 text-slate-300">
          Enter your email and we will send a secure reset link powered by
          Supabase Auth. The link expires in 60 minutes for your safety.
        </p>
      </div>
      <div className="glass-panel w-full max-w-md">
        <PasswordResetForm />
      </div>
    </section>
  );
}
