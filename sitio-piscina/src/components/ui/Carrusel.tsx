"use client";

import { Children, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carrusel con scroll-snap nativo (fluido en el celular).
 * Desde `lg` se convierte en una grilla si `grillaEnDesktop` es true.
 */
export function Carrusel({
  children,
  etiqueta,
  grillaEnDesktop = true,
  claseItem = "w-[85%] sm:w-[60%]",
}: {
  children: React.ReactNode;
  etiqueta: string;
  grillaEnDesktop?: boolean;
  claseItem?: string;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActual(Number((e.target as HTMLElement).dataset.indice));
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-indice]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items.length]);

  const ir = (i: number) => {
    const el = pista.current?.querySelector<HTMLElement>(`[data-indice="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <div role="region" aria-roledescription="carrusel" aria-label={etiqueta} className="relative">
      <div
        ref={pista}
        className={`sin-barra -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-2 pb-6 sm:-mx-6 sm:px-6 ${
          grillaEnDesktop ? "lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0" : ""
        }`}
      >
        {items.map((hijo, i) => (
          <div
            key={i}
            data-indice={i}
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${items.length}`}
            className={`shrink-0 snap-center ${claseItem} ${grillaEnDesktop ? "lg:w-auto" : ""}`}
          >
            {hijo}
          </div>
        ))}
      </div>
      <div className={`mt-1 flex items-center justify-center gap-4 ${grillaEnDesktop ? "lg:hidden" : ""}`}>
        <button
          type="button"
          onClick={() => ir(Math.max(0, actual - 1))}
          disabled={actual === 0}
          aria-label="Anterior"
          className="grid size-11 place-items-center rounded-full bg-white text-mar-800 shadow-suave ring-1 ring-mar-100 transition hover:bg-agua-50 disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ir a la ${i + 1}`}
              aria-current={actual === i}
              className={`h-2.5 rounded-full transition-all duration-300 ${actual === i ? "w-8 bg-agua-600" : "w-2.5 bg-mar-200 hover:bg-mar-300"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => ir(Math.min(items.length - 1, actual + 1))}
          disabled={actual === items.length - 1}
          aria-label="Siguiente"
          className="grid size-11 place-items-center rounded-full bg-white text-mar-800 shadow-suave ring-1 ring-mar-100 transition hover:bg-agua-50 disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
