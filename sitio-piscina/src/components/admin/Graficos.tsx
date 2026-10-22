"use client";

import { useState } from "react";

const compacto = new Intl.NumberFormat("es-UY", { notation: "compact", maximumFractionDigits: 1 });
const entero = new Intl.NumberFormat("es-UY");
const formatos = { numero: (v: number) => entero.format(v), pesos: (v: number) => `$ ${entero.format(v)}` };

/** Redondea el máximo del eje a un número "lindo" (1, 2, 2.5, 5, 10 × 10^n). */
function techo(valor: number) {
  if (valor <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(valor));
  for (const m of [1, 2, 2.5, 5, 10]) if (valor <= m * p) return m * p;
  return 10 * p;
}

type Punto = { etiqueta: string; etiquetaLarga?: string; valor: number };

/**
 * Columnas de una sola serie (sin leyenda: el título dice qué se mide).
 * Barras finas con esquina redondeada arriba, grilla de líneas finas, tooltip al pasar o enfocar,
 * y tabla accesible con los mismos datos.
 */
export function GraficoColumnas({
  titulo,
  subtitulo,
  datos,
  unidad = "numero",
  color = "#0b8ba0",
}: {
  titulo: string;
  subtitulo?: string;
  datos: Punto[];
  unidad?: keyof typeof formatos;
  color?: string;
}) {
  const formato = formatos[unidad];
  const [activo, setActivo] = useState<number | null>(null);
  const max = techo(Math.max(...datos.map((d) => d.valor), 0));
  const marcas = [max, max / 2, 0];
  const iMax = datos.reduce((m, d, i) => (d.valor > datos[m].valor ? i : m), 0);

  return (
    <figure className="rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100 sm:p-6">
      <figcaption>
        <p className="font-bold text-mar-900">{titulo}</p>
        {subtitulo && <p className="text-sm text-mar-500">{subtitulo}</p>}
      </figcaption>
      <div className="mt-5 flex gap-2">
        <div className="relative h-44 w-10 shrink-0 text-right text-xs text-mar-400 tabular-nums" aria-hidden="true">
          {marcas.map((m) => (
            <span key={m} className="absolute right-0 -translate-y-1/2 leading-none" style={{ top: `${(1 - m / max) * 100}%` }}>
              {compacto.format(m)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            {marcas.map((m) => (
              <div key={m} className="absolute inset-x-0 border-t border-mar-100" style={{ top: `${(1 - m / max) * 100}%` }} aria-hidden="true" />
            ))}
            <div className="absolute inset-0 flex items-end gap-0.5">
              {datos.map((d, i) => {
                const alto = (d.valor / max) * 100;
                return (
                  <button
                    key={d.etiqueta + i}
                    type="button"
                    className="group relative flex h-full flex-1 items-end justify-center rounded-md outline-none focus-visible:bg-agua-50"
                    onPointerEnter={() => setActivo(i)}
                    onPointerLeave={() => setActivo(null)}
                    onFocus={() => setActivo(i)}
                    onBlur={() => setActivo(null)}
                    aria-label={`${d.etiquetaLarga ?? d.etiqueta}: ${formato(d.valor)}`}
                  >
                    <span
                      className="block w-full max-w-6 rounded-t-[4px] transition-opacity"
                      style={{ height: `${Math.max(alto, d.valor > 0 ? 1.5 : 0)}%`, background: color, opacity: activo === null || activo === i ? 1 : 0.55 }}
                    />
                    {i === iMax && d.valor > 0 && activo === null && (
                      <span className="pointer-events-none absolute -translate-y-1 text-[0.7rem] font-semibold whitespace-nowrap text-mar-700" style={{ bottom: `${alto}%` }}>
                        {formato(d.valor)}
                      </span>
                    )}
                    {activo === i && (
                      <span className="pointer-events-none absolute z-10 -translate-y-2 rounded-xl bg-mar-950 px-3 py-2 text-left whitespace-nowrap shadow-flotante" style={{ bottom: `${alto}%` }}>
                        <span className="block text-sm font-bold text-white">{formato(d.valor)}</span>
                        <span className="block text-xs text-mar-300">{d.etiquetaLarga ?? d.etiqueta}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex gap-0.5 text-[0.7rem] text-mar-500" aria-hidden="true">
            {datos.map((d, i) => (
              <span key={d.etiqueta + i} className={`flex-1 text-center ${i % 2 === 1 ? "max-sm:invisible" : ""}`}>
                {d.etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-mar-500 hover:text-mar-700">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-mar-500">
              <th className="py-1 font-semibold">Mes</th>
              <th className="py-1 text-right font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => (
              <tr key={d.etiqueta + i} className="border-t border-mar-50">
                <td className="py-1">{d.etiquetaLarga ?? d.etiqueta}</td>
                <td className="py-1 text-right tabular-nums">{formato(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Barras horizontales (ranking) con el valor en la punta. */
export function GraficoBarras({ titulo, subtitulo, datos, color = "#f2563f", vacio = "Sin datos todavía." }: { titulo: string; subtitulo?: string; datos: Punto[]; color?: string; vacio?: string }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <figure className="rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100 sm:p-6">
      <figcaption>
        <p className="font-bold text-mar-900">{titulo}</p>
        {subtitulo && <p className="text-sm text-mar-500">{subtitulo}</p>}
      </figcaption>
      {datos.length === 0 ? (
        <p className="mt-5 text-sm text-mar-500">{vacio}</p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {datos.map((d) => (
            <li key={d.etiqueta} className="grid gap-1" title={`${d.etiqueta}: ${entero.format(d.valor)}`}>
              <span className="truncate text-sm text-mar-800">{d.etiqueta}</span>
              <span className="flex items-center gap-2">
                <span className="h-3 rounded-r-[4px]" style={{ width: `${(d.valor / max) * 85}%`, background: color }} aria-hidden="true" />
                <span className="text-sm font-semibold text-mar-900 tabular-nums">{entero.format(d.valor)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
