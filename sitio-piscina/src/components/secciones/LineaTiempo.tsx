"use client";

import { useEffect, useRef } from "react";

/** Contenedor de la línea de tiempo: la línea se "llena" a medida que scrolleás. */
export function LineaTiempo({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const actualizar = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      el.style.setProperty("--progreso", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative" style={{ "--progreso": 0 } as React.CSSProperties}>
      <div aria-hidden="true" className="absolute top-0 bottom-0 left-6 w-1.5 -translate-x-1/2 rounded-full bg-agua-100 md:left-1/2">
        <div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-agua-400 via-mar-500 to-coral-500" style={{ transform: "scaleY(var(--progreso))" }} />
      </div>
      {children}
    </div>
  );
}
