"use client";

import { useEffect, useRef, useState } from "react";

const formato = new Intl.NumberFormat("es-UY");

/** Número que cuenta hacia arriba cuando entra en pantalla. */
export function Contador({ valor, prefijo = "", sufijo = "", duracion = 1800 }: { valor: number; prefijo?: string; sufijo?: string; duracion?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(valor);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const inicio = performance.now();
        const paso = (t: number) => {
          const p = Math.min(1, (t - inicio) / duracion);
          const suave = 1 - Math.pow(1 - p, 4);
          setN(Math.round(valor * suave));
          if (p < 1) raf = requestAnimationFrame(paso);
        };
        setN(0);
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, duracion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefijo}
      {formato.format(n)}
      {sufijo}
    </span>
  );
}
