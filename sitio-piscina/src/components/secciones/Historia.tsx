import Image from "next/image";
import { Quote } from "lucide-react";
import { aniosDesde } from "@/config/sitio";
import type { ContenidoHistoria, Hito } from "@/lib/contenido/tipos";
import { Encabezado } from "@/components/ui/Encabezado";
import { Contador } from "@/components/ui/Contador";
import { Ola } from "@/components/ui/Ola";
import { Burbujas } from "@/components/ui/Burbujas";
import { LineaTiempo } from "./LineaTiempo";

type Props = { historia: ContenidoHistoria; hitos: Hito[]; nombre: string; ciudad: string; anioFundacion: number };

export function Historia({ historia, hitos, nombre, ciudad, anioFundacion }: Props) {
  const anios = aniosDesde(anioFundacion);
  const { frase, contadores } = historia;
  return (
    <section id="historia" aria-labelledby="titulo-historia" className="relative bg-white pt-20 sm:pt-24">
      <div className="contenedor">
        <Encabezado
          id="titulo-historia"
          etiqueta={`📖 Desde ${anioFundacion}`}
          titulo={
            <>
              {anios} años haciendo <span className="text-coral-500">olas</span> en {ciudad}
            </>
          }
          bajada={historia.bajada}
        />

        <div className="mt-14">
          <LineaTiempo>
            <ol className="grid gap-10 md:gap-4">
              {hitos.map((h, i) => {
                const derecha = i % 2 === 1;
                return (
                  <li key={h.id} className="relative grid pl-16 md:grid-cols-2 md:pl-0">
                    <span
                      aria-hidden="true"
                      className="absolute top-1 left-6 z-10 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-white font-display text-xs font-bold text-mar-900 shadow-suave ring-4 ring-agua-300 md:left-1/2 md:size-14 md:text-sm"
                    >
                      {h.anio}
                    </span>
                    <div
                      data-reveal={derecha ? "derecha" : "izquierda"}
                      className={`${derecha ? "md:col-start-2 md:pl-14" : "md:pr-14 md:text-right"}`}
                    >
                      <div className="tarjeta inline-block w-full p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-flotante sm:p-6">
                        <p className="font-display text-3xl font-bold text-agua-600">{h.anio}</p>
                        <h3 className="mt-1 font-display text-xl font-bold text-mar-900">{h.titulo}</h3>
                        <p className="mt-2 text-mar-700">{h.texto}</p>
                        {h.imagen &&
                          (h.antigua ? (
                            <figure className="mt-5 -rotate-2 rounded-lg bg-white p-2.5 pb-9 shadow-flotante ring-1 ring-mar-100 transition duration-500 hover:rotate-0">
                              <Image src={h.imagen} alt={h.imagenAlt} width={1200} height={900} sizes="(min-width: 768px) 40vw, 80vw" className="aspect-[4/3] rounded-sm object-cover sepia-[.35]" />
                              <figcaption className="mt-2 text-center font-display text-mar-600">Así empezamos ✨</figcaption>
                            </figure>
                          ) : (
                            <figure className="mt-5 overflow-hidden rounded-3xl shadow-suave">
                              <Image src={h.imagen} alt={h.imagenAlt} width={1200} height={900} sizes="(min-width: 768px) 40vw, 80vw" className="aspect-[4/3] object-cover transition duration-700 hover:scale-105" />
                              <figcaption className="sr-only">{h.imagenAlt}</figcaption>
                            </figure>
                          ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </LineaTiempo>
        </div>

        <figure data-reveal="zoom" className="relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-5xl bg-gradient-to-br from-sol-300 via-sol-400 to-coral-400 p-8 text-mar-950 shadow-flotante sm:p-12">
          <Quote aria-hidden="true" className="absolute -top-2 -left-2 size-32 rotate-180 text-white/30" />
          <blockquote className="relative font-display text-2xl leading-snug font-semibold sm:text-3xl">“{frase.texto}”</blockquote>
          <figcaption className="relative mt-6 flex items-center gap-4">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-white font-display text-xl font-bold text-coral-600 shadow-suave">
              {frase.autor
                .split(" ")
                .filter((p) => p.length > 1)
                .map((p) => p[0])
                .join("")}
            </span>
            <span>
              <span className="block font-display text-lg font-bold">{frase.autor}</span>
              <span className="text-mar-800">
                {frase.rol} de {nombre}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="relative mt-20">
        <Ola className="text-agua-600" variante={2} />
        <div className="relative overflow-hidden bg-gradient-to-b from-agua-600 to-mar-800 pt-12 pb-16">
          <Burbujas cantidad={8} opacidad={0.4} />
          <ul className="contenedor relative grid grid-cols-2 gap-8 text-center text-white md:grid-cols-4">
            {contadores.map((c, i) => (
              <li key={c.label} data-reveal style={{ "--retraso": `${i * 100}ms` } as React.CSSProperties}>
                <p className="font-display text-5xl font-bold sm:text-6xl">
                  <Contador valor={c.valor === "anios" ? anios : c.valor} prefijo={c.prefijo} />
                </p>
                <p className="mt-1 font-semibold text-agua-100">{c.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
