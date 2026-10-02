"use client";

import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { TOAST_DURATION_MS } from "@/constants/ui";

type ToastTone = "success" | "error" | "info";

interface ToastInput {
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastItem extends ToastInput {
  id: number;
}

const TONE_STYLES: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  success: { icon: CircleCheck, className: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: CircleAlert, className: "text-red-600 dark:text-red-400" },
  info: { icon: Info, className: "text-primary dark:text-indigo-300" },
};

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/** Lives in the root layout, so toasts survive client-side navigation. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((all) => [...all, { ...toast, id }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {toasts.map((t) => {
          const { icon: Icon, className } = TONE_STYLES[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full animate-slide-in items-start gap-3 rounded-xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${className}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1.5 grid size-8 place-items-center rounded-md text-muted transition hover:bg-surface-muted hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside <ToastProvider>");
  return toast;
}
