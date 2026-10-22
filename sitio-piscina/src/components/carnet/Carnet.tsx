"use client";

import { forwardRef, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Repeat } from "lucide-react";
import { LogoIcono } from "@/components/ui/Logo";
import { formatoCedula, formatoNumeroSocio, fecha } from "@/lib/formato";
import type { EstadoSocio, Socio } from "@/lib/socio/tipos";

export const estiloEstado: Record<EstadoSocio, { pill: string; texto: string; banda: string; emoji: string }> = {
  activo: { pill: "bg-emerald-400 text-emerald-950", texto: "ACTIVO", banda: "bg-emerald-500", emoji: "✅" },
  vencido: { pill: "bg-red-600 text-white", texto: "VENCIDO", banda: "bg-red-600", emoji: "❌" },
  pendiente: { pill: "bg-sol-300 text-mar-950", texto: "PENDIENTE", banda: "bg-sol-400", emoji: "⏳" },
  suspendido: { pill: "bg-mar-300 text-mar-950", texto: "SUSPENDIDO", banda: "bg-mar-500", emoji: "⛔" },
};

export type DatosCarnet = {
  socio: Socio;
  estado: EstadoSocio;
  foto: string | null;
  plan: string;
  qr: string | null;
  negocio: { nombre: string; logoUrl: string | null };
};

function Marca({ negocio }: { negocio: DatosCarnet["negocio"] }) {
  return (
    <span className="flex items-center gap-2">
      {negocio.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={negocio.logoUrl} alt="" className="size-8 rounded-xl object-cover" />
      ) : (
        <LogoIcono className="size-8" />
      )}
      <span className="font-display text-lg leading-none font-bold">{negocio.nombre}</span>
    </span>
  );
}

/** Frente del carnet (también es lo que se descarga como imagen). */
export const FrenteCarnet = forwardRef<HTMLDivElement, DatosCarnet & { className?: string }>(function FrenteCarnet(
  { socio, estado, foto, plan, qr, negocio, className = "" },
  ref,
) {
  const e = estiloEstado[estado];
  return (
    <div ref={ref} className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-agua-500 via-agua-600 to-mar-700 p-5 text-white ${className}`}>
      {/* Ondas decorativas */}
      <svg aria-hidden="true" viewBox="0 0 340 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-28 w-full opacity-25">
        <path d="M0 60 C60 30 110 90 170 60 S280 30 340 60 V120 H0Z" fill="#fff" />
        <path d="M0 85 C60 60 110 110 170 85 S280 60 340 85 V120 H0Z" fill="#fff" opacity=".6" />
      </svg>
      <div aria-hidden="true" className="absolute -top-16 -right-16 size-44 rounded-full bg-sol-300/25" />

      <div className="relative flex items-center justify-between gap-2">
        <Marca negocio={negocio} />
        <span className={`rounded-full px-3 py-1 font-display text-xs font-bold tracking-wider shadow-sm ${e.pill}`}>● {e.texto}</span>
      </div>

      <div className="relative mt-4 flex gap-4">
        <div className="relative w-[42%] shrink-0">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Foto de ${socio.nombre_completo}`} className="aspect-[3/4] w-full rounded-2xl object-cover ring-4 ring-white/70" />
          ) : (
            <div className="grid aspect-[3/4] w-full place-items-center rounded-2xl bg-white/20 text-4xl ring-4 ring-white/50">🙂</div>
          )}
          {estado === "vencido" && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-12 rounded-md border-2 border-white bg-red-600/90 py-1 text-center font-display text-sm font-bold tracking-widest">
              VENCIDO
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] text-agua-100 uppercase">Socio/a</p>
          <p className="font-display text-xl leading-tight font-bold break-words">{socio.nombre_completo}</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-[0.15em] text-agua-100 uppercase">Cédula</dt>
              <dd className="font-semibold tabular-nums">{formatoCedula(socio.cedula)}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-[0.15em] text-agua-100 uppercase">N.º de socio</dt>
              <dd className="font-display text-lg leading-none font-bold tabular-nums">{formatoNumeroSocio(socio.numero_socio)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[0.65rem] font-semibold tracking-[0.15em] text-agua-100 uppercase">Plan</dt>
            <dd className="font-semibold">{plan}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold tracking-[0.15em] text-agua-100 uppercase">Vence</dt>
            <dd className={`font-display text-lg leading-none font-bold tabular-nums ${estado === "vencido" ? "text-red-200" : ""}`}>{fecha(socio.vence_el)}</dd>
          </div>
        </dl>
        <div className="rounded-2xl bg-white p-2 shadow-lg">
          {qr ? <QRCodeSVG value={qr} size={96} level="M" fgColor="#071a33" /> : <div className="grid size-24 place-items-center text-center text-[0.6rem] font-semibold text-mar-500">QR al confirmar el pago</div>}
        </div>
      </div>
    </div>
  );
});

/** Carnet completo: gira al tocarlo y tiene brillo que sigue al dedo/mouse. */
export function Carnet({ refFrente, ...props }: DatosCarnet & { refFrente?: React.Ref<HTMLDivElement> }) {
  const [girado, setGirado] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const mover = (ev: React.PointerEvent) => {
    const el = caja.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--x", `${x * 100}%`);
      el.style.setProperty("--y", `${y * 100}%`);
      el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    });
  };
  const salir = () => {
    const el = caja.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const e = estiloEstado[props.estado];

  return (
    <div className="mx-auto w-full max-w-[22rem]">
      <div
        ref={caja}
        onPointerMove={mover}
        onPointerLeave={salir}
        className="relative"
        style={{ "--x": "30%", "--y": "20%", "--rx": "0deg", "--ry": "0deg" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={() => setGirado((g) => !g)}
          aria-label={girado ? "Ver el frente del carnet" : "Girar el carnet para ver el QR grande"}
          className="escena-3d block w-full rounded-[1.75rem] text-left outline-none focus-visible:ring-4 focus-visible:ring-sol-400"
        >
          <div
            className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
            style={{ transform: "rotateX(var(--rx)) rotateY(var(--ry))" }}
          >
            <div className={`giro-3d relative ${girado ? "girada" : ""}`}>
              <div className="cara relative shadow-flotante [border-radius:1.75rem]">
                <FrenteCarnet {...props} ref={refFrente} />
                {/* Brillo holográfico */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[1.75rem] mix-blend-soft-light"
                  style={{ background: "radial-gradient(circle at var(--x) var(--y), rgb(255 255 255 / 0.65), transparent 45%)" }}
                />
                <div aria-hidden="true" className="brillo-carnet pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" />
              </div>

              <div className="cara cara-atras absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-mar-800 to-mar-950 p-5 text-center text-white shadow-flotante">
                <span className={`rounded-full px-4 py-1 font-display text-sm font-bold tracking-wider ${e.pill}`}>● {e.texto}</span>
                <div className="rounded-3xl bg-white p-3">
                  {props.qr ? <QRCodeSVG value={props.qr} size={208} level="M" fgColor="#071a33" /> : <div className="grid size-52 place-items-center text-mar-500">Sin QR todavía</div>}
                </div>
                <p className="font-display text-lg font-bold tabular-nums">N.º {formatoNumeroSocio(props.socio.numero_socio)}</p>
                <p className="text-sm text-mar-200">Mostrá este código en la entrada. Es personal e intransferible.</p>
              </div>
            </div>
          </div>
        </button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-mar-500">
        <Repeat className="size-4" aria-hidden="true" /> Tocá el carnet para girarlo
      </p>
    </div>
  );
}
