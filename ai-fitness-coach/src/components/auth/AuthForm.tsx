"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AuthFormProps {
  variant: "login" | "signup";
}

export const AuthForm = ({ variant }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        if (variant === "signup") {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });

          if (error) throw error;
          setMessage("Check your inbox to confirm your email.");
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        setMessage((error as Error).message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-500 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Please wait..." : variant === "login" ? "Log in" : "Create account"}
      </button>
      {message && <p className="text-center text-sm text-amber-300">{message}</p>}
    </form>
  );
};
