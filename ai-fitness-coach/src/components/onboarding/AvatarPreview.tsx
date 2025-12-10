import { AvatarMetrics } from "@/types";

const widthByShoulder: Record<AvatarMetrics["shoulder"], number> = {
  small: 140,
  medium: 170,
  wide: 200,
};

const waistByWidth: Record<AvatarMetrics["waist"], number> = {
  tight: 80,
  average: 110,
  blocky: 140,
};

const outlineByMuscle: Record<AvatarMetrics["muscle"], string> = {
  lean: "stroke-2",
  athletic: "stroke-[3px]",
  massive: "stroke-[4px]",
};

interface AvatarPreviewProps {
  metrics: AvatarMetrics;
}

export const AvatarPreview = ({ metrics }: AvatarPreviewProps) => {
  const shoulder = widthByShoulder[metrics.shoulder];
  const waist = waistByWidth[metrics.waist];

  const points = [
    [200 - shoulder, 60],
    [200 + shoulder, 60],
    [200 + waist, 220],
    [200 - waist, 220],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4">
      <p className="text-sm text-slate-400">Avatar preview</p>
      <svg viewBox="0 0 400 400" className="mt-4 h-64 w-full">
        <defs>
          <linearGradient id="avatarGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points[0][0]},${points[0][1]} L ${points[1][0]},${points[1][1]} L ${points[2][0]},${points[2][1]} Q 200,320 ${points[3][0]},${points[3][1]} Z`}
          fill="url(#avatarGradient)"
          className={outlineByMuscle[metrics.muscle]}
          stroke="#064e3b"
        />
        <circle cx="200" cy="30" r="28" fill="#34d399" className="opacity-80" />
      </svg>
    </div>
  );
};
