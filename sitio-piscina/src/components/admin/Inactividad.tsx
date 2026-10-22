"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { MINUTOS_INACTIVIDAD_ADMIN, modoDemo } from "@/lib/entorno";

const AVISO_SEG = 60;
const CLAVE = "admin:ultima-actividad";

/** Cierra la sesión del panel después de un rato sin actividad (con aviso 1 minuto antes). */
export function Inactividad() {
  const router = useRouter();
  const [restante, setRestante] = useState<number | null>(null);
  const ultimoLatido = useRef(0);

  useEffect(() => {
    if (modoDemo) return;
    const limite = MINUTOS_INACTIVIDAD_ADMIN * 60_000;
    const marcar = () => {
      const ahora = Date.now();
      try {
        localStorage.setItem(CLAVE, String(ahora));
      } catch {
        /* nada */
      }
      // Avisa al servidor que seguimos activos (cada 5 minutos como mucho)
      if (ahora - ultimoLatido.current > 5 * 60_000) {
        ultimoLatido.current = ahora;
        fetch("/admin/latido", { cache: "no-store" }).catch(() => {});
      }
    };
    const ultima = () => {
      try {
        return Number(localStorage.getItem(CLAVE)) || Date.now();
      } catch {
        return Date.now();
      }
    };
    marcar();
    const eventos = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    eventos.forEach((ev) => window.addEventListener(ev, marcar, { passive: true }));

    const reloj = setInterval(async () => {
      const queda = limite - (Date.now() - ultima());
      if (queda <= 0) {
        clearInterval(reloj);
        await supabaseNavegador().auth.signOut();
        router.replace("/admin/ingresar?motivo=inactividad");
      } else setRestante(queda <= AVISO_SEG * 1000 ? Math.ceil(queda / 1000) : null);
    }, 1000);

    return () => {
      clearInterval(reloj);
      eventos.forEach((ev) => window.removeEventListener(ev, marcar));
    };
  }, [router]);

  if (restante === null) return null;
  return (
    <div role="alertdialog" aria-modal="true" aria-label="Sesión por vencer" className="fixed inset-0 z-[90] grid place-items-center bg-mar-950/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-flotante">
        <p className="text-4xl" aria-hidden="true">
          ⏰
        </p>
        <p className="mt-2 text-lg font-bold text-mar-900">Tu sesión se cierra en {restante} s</p>
        <p className="mt-1 text-mar-600">Por seguridad cerramos el panel cuando no se usa.</p>
        <button type="button" className="btn btn-agua btn-chico mt-4" onClick={() => setRestante(null)}>
          Seguir conectado
        </button>
      </div>
    </div>
  );
}
