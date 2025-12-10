"use client";

import { useEffect, useMemo, useState } from "react";
import { AvatarMetrics } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const widthByShoulder: Record<AvatarMetrics["shoulder"], number> = {
  small: 120,
  medium: 160,
  wide: 200,
};

const waistByWidth: Record<AvatarMetrics["waist"], number> = {
  tight: 70,
  average: 105,
  blocky: 140,
};

const outlineByMuscle: Record<AvatarMetrics["muscle"], string> = {
  lean: "stroke-2",
  athletic: "stroke-[3px]",
  massive: "stroke-[4px]",
};

const scaleByMuscle: Record<AvatarMetrics["muscle"], number> = {
  lean: 0.95,
  athletic: 1,
  massive: 1.06,
};

const fallbackMetrics: AvatarMetrics = {
  shoulder: "medium",
  waist: "average",
  muscle: "athletic",
};

interface AvatarPreviewProps {
  metrics?: AvatarMetrics;
  autoLoadProfile?: boolean;
  title?: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";

export const AvatarPreview = ({ metrics, autoLoadProfile = false, title = "Avatar preview" }: AvatarPreviewProps) => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [state, setState] = useState<LoadState>(autoLoadProfile ? "loading" : "ready");
  const [error, setError] = useState<string | null>(null);
  const [remoteMetrics, setRemoteMetrics] = useState<AvatarMetrics | null>(metrics ?? null);

  useEffect(() => {
    if (!autoLoadProfile) return;

    let mounted = true;
    const fetchProfile = async () => {
      setState("loading");
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          setError("Log in to visualize your avatar");
          setState("error");
        }
        return;
      }

      const { data, error: profileError } = await supabase
        .from("user_profile")
        .select("avatar_metrics, shoulder_width, body_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        if (mounted) {
          setError("Could not load measurements");
          setState("error");
        }
        return;
      }

      const resolved: AvatarMetrics = {
        shoulder: (data?.avatar_metrics?.shoulder ?? data?.shoulder_width ?? fallbackMetrics.shoulder) as AvatarMetrics["shoulder"],
        waist: (data?.avatar_metrics?.waist ?? fallbackMetrics.waist) as AvatarMetrics["waist"],
        muscle:
          (data?.avatar_metrics?.muscle ??
            (data?.body_type === "ecto"
              ? "lean"
              : data?.body_type === "endo"
              ? "massive"
              : "athletic")) as AvatarMetrics["muscle"],
      };

      if (mounted) {
        setRemoteMetrics(resolved);
        setState("ready");
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [autoLoadProfile, supabase]);

  const activeMetrics = remoteMetrics ?? metrics ?? fallbackMetrics;
  const shoulder = widthByShoulder[activeMetrics.shoulder];
  const waist = waistByWidth[activeMetrics.waist];
  const scale = scaleByMuscle[activeMetrics.muscle];

  const points = [
    [200 - shoulder, 60],
    [200 + shoulder, 60],
    [200 + waist, 240],
    [200 - waist, 240],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      {state === "loading" && (
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-white/5" />
      )}
      {state === "error" && (
        <p className="mt-4 text-sm text-amber-300">{error}</p>
      )}
      {state !== "loading" && (
        <svg viewBox="0 0 400 400" className="mt-4 h-64 w-full">
          <defs>
            <linearGradient id="avatarGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <g transform={`translate(200 200) scale(${scale}) translate(-200 -200)`}>
            <path
              d={`M ${points[0][0]},${points[0][1]} L ${points[1][0]},${points[1][1]} L ${points[2][0]},${points[2][1]} Q 200,330 ${points[3][0]},${points[3][1]} Z`}
              fill="url(#avatarGradient)"
              className={outlineByMuscle[activeMetrics.muscle]}
              stroke="#064e3b"
            />
            <circle cx="200" cy="40" r="30" fill="#34d399" className="opacity-80" />
          </g>
        </svg>
      )}
    </div>
  );
};
