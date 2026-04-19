"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastTone = "success" | "warning" | "danger" | "info";

interface ToastMessage {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warn: (title: string, description?: string) => void;
}

const Ctx = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  danger: <XCircle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
} as const;

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-[color:rgba(16,185,129,0.3)] text-[var(--ad-success)]",
  warning: "border-[color:rgba(245,158,11,0.3)] text-[var(--ad-warning)]",
  danger: "border-[color:rgba(239,68,68,0.3)] text-[var(--ad-danger)]",
  info: "border-[color:rgba(59,130,246,0.3)] text-[var(--ad-info)]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([]);

  const toast = useCallback((t: Omit<ToastMessage, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4500);
  }, []);

  const value: ToastContextValue = {
    toast,
    success: (title, description) => toast({ tone: "success", title, description }),
    error: (title, description) => toast({ tone: "danger", title, description }),
    info: (title, description) => toast({ tone: "info", title, description }),
    warn: (title, description) => toast({ tone: "warning", title, description }),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: "calc(100vw - 40px)" }}>
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[360px] bg-[var(--ad-surface)] border rounded-[10px] shadow-[var(--ad-shadow-lg)] p-3.5 ${TONE_STYLES[t.tone]}`}
            style={{ animation: "toastIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <span className="flex-shrink-0 mt-0.5">{ICONS[t.tone]}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[var(--ad-fg)]">{t.title}</div>
              {t.description && <div className="mt-0.5 text-[12px] text-[var(--ad-fg-muted)] leading-relaxed">{t.description}</div>}
            </div>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== t.id))}
              className="flex-shrink-0 text-[var(--ad-fg-subtle)] hover:text-[var(--ad-fg)] transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback so pages don't crash if mounted outside provider
    const noop: ToastContextValue = {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    };
    return noop;
  }
  return ctx;
}
