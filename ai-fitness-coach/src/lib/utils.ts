export const formatDate = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const classNames = (...inputs: Array<string | undefined | null | false>) =>
  inputs.filter(Boolean).join(" ");

export const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};
