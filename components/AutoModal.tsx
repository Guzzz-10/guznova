"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Auto } from "@/data/autos";
import { ease } from "@/lib/motion";
import { AutoInfo } from "./AutoInfo";
import { Gallery } from "./Gallery";

type Selected = { auto: Auto; scope: string } | null;
type Ctx = { open: (auto: Auto, scope: string) => void; close: () => void };

const AutoModalContext = createContext<Ctx | null>(null);

export const useAutoModal = () => {
  const ctx = useContext(AutoModalContext);
  if (!ctx) throw new Error("useAutoModal debe usarse dentro de AutoModalProvider");
  return ctx;
};

/** id del layout compartido entre la tarjeta y el modal */
export const imgLayoutId = (scope: string, id: string) => `${scope}-img-${id}`;

export function AutoModalProvider({ children }: { children: ReactNode }) {
  const [sel, setSel] = useState<Selected>(null);
  const close = useCallback(() => setSel(null), []);
  const open = useCallback((auto: Auto, scope: string) => setSel({ auto, scope }), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sel, close]);

  return (
    <AutoModalContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {sel && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
            />
            <motion.div
              key="scroller"
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={`${sel.auto.marca} ${sel.auto.modelo}`}
              className="fixed inset-0 z-[61] overflow-y-auto overscroll-contain"
              onClick={close}
              initial={{ opacity: 1 }}
              exit={{ opacity: 1 }}
            >
              <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-6xl overflow-hidden rounded-t-3xl border border-line bg-surface sm:rounded-3xl"
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 32 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar"
                    autoFocus
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg/70 backdrop-blur transition-colors hover:bg-bg"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>

                  <div className="grid gap-8 p-4 sm:p-6 md:grid-cols-[1.3fr_1fr] md:gap-10 md:p-8">
                    <Gallery
                      auto={sel.auto}
                      layoutId={imgLayoutId(sel.scope, sel.auto.id)}
                    />
                    <div className="pb-4 md:pt-6">
                      <AutoInfo auto={sel.auto} onNavigate={close} />
                      <Link
                        href={`/auto/${sel.auto.slug}`}
                        onClick={close}
                        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
                      >
                        Ver ficha completa
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AutoModalContext.Provider>
  );
}
