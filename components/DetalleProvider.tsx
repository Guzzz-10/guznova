"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { Auto } from "@/data/autos";
import { getLenis } from "@/lib/lenis";
import { ease } from "@/lib/motion";
import { DetalleBody } from "./DetalleBody";

type Sel = { auto: Auto; ctx: string } | null;
const Ctx = createContext<{ open: (a: Auto, ctx: string) => void }>({ open: () => {} });
export const useDetalle = () => useContext(Ctx);

export function DetalleProvider({ children }: { children: ReactNode }) {
  const [sel, setSel] = useState<Sel>(null);
  const open = useCallback((auto: Auto, ctx: string) => setSel({ auto, ctx }), []);
  const close = useCallback(() => setSel(null), []);

  useEffect(() => {
    if (!sel) return;
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [sel, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {sel && (
          <div key="modal" className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`${sel.auto.marca} ${sel.auto.modelo}`}>
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              onClick={close}
            />
            <div data-lenis-prevent className="absolute inset-0 overflow-y-auto overscroll-contain" onClick={(e) => e.target === e.currentTarget && close()}>
              <motion.div
                className="relative mx-auto min-h-full bg-paper md:my-10 md:min-h-0 md:max-w-5xl md:rounded-3xl md:shadow-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                transition={{ duration: 0.7, ease }}
              >
                <button
                  onClick={close}
                  aria-label="Cerrar detalle"
                  className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper/80 shadow-sm backdrop-blur-md transition-transform duration-300 hover:scale-105"
                >
                  <X strokeWidth={1.5} className="h-5 w-5" />
                </button>
                <DetalleBody auto={sel.auto} layoutId={`${sel.ctx}-img-${sel.auto.slug}`} />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
