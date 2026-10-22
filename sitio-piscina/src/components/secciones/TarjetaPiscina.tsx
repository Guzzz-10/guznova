"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDownToLine, Repeat, Ruler, Thermometer, Users } from "lucide-react";
import type { Piscina } from "@/lib/contenido/tipos";

const colores = {
  agua: { fondo: "from-agua-600 to-mar-700", chip: "bg-agua-100 text-agua-800", acento: "text-agua-200" },
  coral: { fondo: "from-coral-500 to-coral-700", chip: "bg-coral-100 text-coral-800", acento: "text-coral-100" },
  sol: { fondo: "from-sol-500 to-sol-700", chip: "bg-sol-100 text-sol-800", acento: "text-sol-100" },
};

/** Tarjeta que gira: adelante la foto, atrás la ficha técnica. */
export function TarjetaPiscina({ piscina }: { piscina: Piscina }) {
  const [girada, setGirada] = useState(false);
  const c = colores[piscina.color];

  return (
    <article
      tabIndex={0}
      aria-label={piscina.nombre}
      className="escena-3d group h-[29rem] rounded-4xl outline-none focus-visible:ring-4 focus-visible:ring-sol-400 sm:h-[31rem]"
    >
      {/* En desktop gira al pasar el mouse o con el teclado; en el celular, con los botones. */}
      <div
        className={`giro-3d relative size-full group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] ${girada ? "girada" : ""}`}
      >
        {/* Frente */}
        <div className="cara absolute inset-0 overflow-hidden rounded-4xl bg-mar-900 shadow-flotante">
          <Image
            src={piscina.imagen}
            alt={`Foto de ${piscina.nombre}`}
            fill
            sizes="(min-width: 1024px) 33vw, 85vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mar-950/90 via-mar-950/20 to-transparent" />
          <span className={`chip absolute top-4 left-4 ${c.chip}`}>{piscina.tipo}</span>
          <span className="chip absolute top-4 right-4 bg-white/90 text-mar-900">
            <Thermometer className="size-4 text-coral-500" aria-hidden="true" /> {piscina.temperatura}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h3 className="font-display text-3xl font-bold text-white">{piscina.nombre}</h3>
            <p className="mt-1 text-mar-100">{piscina.descripcion}</p>
            <p className="mt-4 hidden items-center gap-2 text-sm font-semibold text-agua-100 [@media(hover:hover)]:inline-flex">
              <Repeat className="size-4" aria-hidden="true" /> Pasá el mouse para ver la ficha
            </p>
            <button
              type="button"
              onClick={() => setGirada(true)}
              className="mt-4 [@media(hover:hover)]:hidden inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25"
            >
              <Repeat className="size-4" aria-hidden="true" /> Ver ficha técnica
            </button>
          </div>
        </div>

        {/* Dorso */}
        <div className={`cara cara-atras absolute inset-0 overflow-hidden rounded-4xl bg-gradient-to-br ${c.fondo} p-6 text-white shadow-flotante sm:p-7`}>
          <div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 size-56 rounded-full bg-white/10" />
          <div className="relative flex h-full flex-col">
            <p className={`text-sm font-semibold tracking-wider uppercase ${c.acento}`}>{piscina.tipo}</p>
            <h3 className="font-display text-3xl font-bold">{piscina.nombre}</h3>
            <dl className="mt-5 grid gap-3.5">
              {[
                { Icono: Ruler, k: "Medidas", v: piscina.medidas },
                { Icono: ArrowDownToLine, k: "Profundidad", v: piscina.profundidad },
                { Icono: Thermometer, k: "Temperatura del agua", v: piscina.temperatura },
              ].map(({ Icono, k, v }) => (
                <div key={k} className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-2.5 ring-1 ring-white/15">
                  <Icono className="size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-semibold tracking-wide uppercase opacity-80">{k}</dt>
                    <dd className="font-display text-lg font-semibold">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
                <Users className="size-4" aria-hidden="true" /> Ideal para
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {piscina.idealPara.map((i) => (
                  <li key={i} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-mar-900">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setGirada(false)}
              className="mt-auto [@media(hover:hover)]:hidden inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/40 transition hover:bg-white/25"
            >
              <Repeat className="size-4" aria-hidden="true" /> Volver a la foto
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
