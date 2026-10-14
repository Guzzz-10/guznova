"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { resetConsent, useConsent, writeConsent } from "@/lib/consent";

export function CookieBanner() {
  const consent = useConsent();
  const show = consent === null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Consentimiento de cookies"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.6 }}
          className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
        >
          <div className="rounded-2xl border border-white/10 bg-ink-850/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex gap-3">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-nova-400" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-200">
                Usamos cookies propias necesarias para que el sitio funcione y, si aceptás, servicios de terceros
                (como el mapa de Google). Podés cambiar tu elección cuando quieras.{" "}
                <Link href="/cookies" className="text-nova-400 underline underline-offset-2">
                  Más información
                </Link>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => writeConsent("rejected")} className="btn-ghost !py-2.5">
                Rechazar
              </button>
              <button type="button" onClick={() => writeConsent("accepted")} className="btn-primary !py-2.5">
                Aceptar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" onClick={resetConsent} className="text-ink-400 transition hover:text-nova-400">
      Configurar cookies
    </button>
  );
}
