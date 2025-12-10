import { create } from "zustand";
import { useEffect } from "react";

type ToastType = "success" | "error";

interface ToastState {
  message: string | null;
  type: ToastType;
  show: boolean;
  trigger: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "success",
  show: false,
  trigger: (message, type = "success") =>
    set({ message, type, show: true }),
  hide: () => set({ show: false }),
}));

export const ToastContainer = () => {
  const { message, type, show, hide } = useToastStore();

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => hide(), 3200);
    return () => clearTimeout(timer);
  }, [show, hide]);

  if (!show || !message) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center px-4">
      <div
        className={`max-w-md rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${
          type === "success"
            ? "bg-emerald-500/90"
            : "bg-rose-500/90"
        }`}
      >
        {message}
      </div>
    </div>
  );
};
