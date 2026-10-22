"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";
import { formatoCedula, formatoNumeroSocio, fecha } from "@/lib/formato";
import { estiloEstado, type DatosCarnet } from "./Carnet";

type WakeLock = { release: () => Promise<void> };

/** Carnet en pantalla completa para mostrar en la entrada: grande, claro y con hora en vivo. */
export function PaseEntrada({ datos, onCerrar }: { datos: DatosCarnet; onCerrar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hora, setHora] = useState(() => new Date());
  const e = estiloEstado[datos.estado];

  useEffect(() => {
    const el = ref.current;
    let bloqueo: WakeLock | null = null;
    el?.requestFullscreen?.().catch(() => {});
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLock> } };
    nav.wakeLock?.request("screen").then((w) => (bloqueo = w)).catch(() => {});
    const reloj = setInterval(() => setHora(new Date()), 1000);
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onCerrar();
    const onFs = () => !document.fullscreenElement && document.body.dataset.paseAbierto === "1" && onCerrar();
    document.body.dataset.paseAbierto = "1";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      clearInterval(reloj);
      bloqueo?.release().catch(() => {});
      delete document.body.dataset.paseAbierto;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [onCerrar]);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Carnet en pantalla completa" className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-white">
      <div className={`${e.banda} relative px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5 text-center text-white`}>
        <p className="font-display text-5xl font-bold tracking-wide sm:text-6xl">
          {e.texto} {e.emoji}
        </p>
        <p className="mt-1 font-display text-2xl tabular-nums" aria-label="Hora actual">
          {hora.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
        <button type="button" onClick={onCerrar} aria-label="Cerrar pantalla completa" className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-12 place-items-center rounded-full bg-black/20 hover:bg-black/30">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 px-5 py-6 text-center">
        <div className="flex items-center gap-4 text-left">
          {datos.foto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={datos.foto} alt={`Foto de ${datos.socio.nombre_completo}`} className="aspect-[3/4] w-28 rounded-2xl object-cover shadow-suave sm:w-36" />
          )}
          <div>
            <p className="font-display text-2xl leading-tight font-bold text-mar-950 sm:text-3xl">{datos.socio.nombre_completo}</p>
            <p className="mt-1 text-lg text-mar-700">CI {formatoCedula(datos.socio.cedula)}</p>
            <p className="font-display text-xl font-bold text-mar-900 tabular-nums">N.º {formatoNumeroSocio(datos.socio.numero_socio)}</p>
            <p className="text-mar-600">
              {datos.plan} · vence {fecha(datos.socio.vence_el)}
            </p>
          </div>
        </div>
        {datos.qr && (
          <div className="rounded-3xl bg-white p-3 shadow-flotante ring-1 ring-mar-100">
            <QRCodeSVG value={datos.qr} size={300} level="M" fgColor="#000000" className="h-auto w-[min(78vw,20rem)]" />
          </div>
        )}
        <p className="text-sm font-semibold text-mar-500">Subí el brillo de la pantalla para que el QR se lea mejor · {datos.negocio.nombre}</p>
      </div>
    </div>
  );
}
