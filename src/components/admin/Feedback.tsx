"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Toast = { id: number; type: "success" | "error"; message: string };
type ConfirmOptions = { title: string; message?: string; confirmText?: string; cancelText?: string; danger?: boolean };

const Ctx = createContext<{
  toast: (type: Toast["type"], message: string) => void;
  confirm: (o: ConfirmOptions) => Promise<boolean>;
} | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("FeedbackProvider faltante");
  return c.toast;
}
export function useConfirm() {
  const c = useContext(Ctx);
  if (!c) throw new Error("FeedbackProvider faltante");
  return c.confirm;
}

/** Mensajes de éxito/error y confirmaciones antes de acciones importantes. */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((type: Toast["type"], message: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })),
    [],
  );

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-3 sm:bottom-6 sm:left-auto sm:right-6 sm:top-auto sm:items-end" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role={t.type === "error" ? "alert" : "status"}
              data-toast={t.type}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 text-sm font-medium shadow-xl",
                t.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900",
              )}
            >
              {t.type === "success" ? (
                <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <CircleAlert className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
              )}
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="-m-1 rounded p-1 opacity-60 hover:opacity-100"
                aria-label="Cerrar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>{dialog && <ConfirmDialog {...dialog} onClose={close} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

function ConfirmDialog({ title, message, confirmText = "Confirmar", cancelText = "Cancelar", danger, onClose }: ConfirmOptions & { onClose: (v: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-end p-3 sm:place-items-center" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <motion.div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose(false)} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex gap-4">
          <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", danger ? "bg-red-100 text-red-600" : "bg-nova-100 text-nova-700")}>
            <TriangleAlert className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-bold text-ink-900">
              {title}
            </h2>
            {message && <p className="mt-1 text-sm text-ink-600">{message}</p>}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className="a-btn-secondary !py-3">
            {cancelText}
          </button>
          <button type="button" onClick={() => onClose(true)} className={cn(danger ? "a-btn-danger" : "a-btn-primary", "!py-3")}>
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
