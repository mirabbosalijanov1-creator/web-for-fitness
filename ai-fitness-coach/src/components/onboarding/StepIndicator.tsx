interface StepIndicatorProps {
  total: number;
  current: number;
}

export const StepIndicator = ({ total, current }: StepIndicatorProps) => (
  <div className="flex items-center gap-2 text-sm text-slate-300">
    {Array.from({ length: total }).map((_, index) => (
      <span
        key={`step-${index}`}
        className={`h-1 flex-1 rounded-full ${
          index <= current ? "bg-emerald-400" : "bg-white/10"
        }`}
      />
    ))}
    <span className="ml-4">
      Step {current + 1} / {total}
    </span>
  </div>
);
