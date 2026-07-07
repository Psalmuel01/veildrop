"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const kindStyles: Record<ToastKind, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: "border-success-600/30 text-success-700" },
  error: { icon: XCircle, className: "border-error-600/30 text-error-700" },
  info: { icon: Info, className: "border-accent-600/30 text-accent-700" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, className } = kindStyles[toast.kind];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-xl border bg-paper-50 p-4 shadow-[0_8px_30px_-8px_rgba(28,24,17,0.25)]",
                  className,
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{toast.title}</p>
                  {toast.description && <p className="mt-0.5 text-xs text-ink-500">{toast.description}</p>}
                </div>
                <button onClick={() => dismiss(toast.id)} className="text-ink-500 hover:text-ink-900">
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
