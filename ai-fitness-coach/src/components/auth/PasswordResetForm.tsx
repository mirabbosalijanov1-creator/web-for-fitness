"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const PasswordResetForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset instructions sent. Check your inbox.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Enter your account email
      </label>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
        required
      />
      <button
        type="submit"
        className="w-full rounded-xl border border-white/20 py-2 font-semibold text-white transition hover:border-white/60"
      >
        Send reset link
      </button>
      {message && <p className="text-center text-sm text-emerald-300">{message}</p>}
    </form>
  );
};
