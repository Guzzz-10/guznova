"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { FotoGaleria } from "@/lib/contenido/tipos";

/** Galería en mosaico + lightbox accesible (teclado, swipe y botones). */
export function Galeria({ fotos: galeria }: { fotos: FotoGaleria[] }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [indice, setIndice] = useState<number | null>(null);
  const toque = useRef<number | null>(null);

  const abrir = (i: number) => {
    setIndice(i);
    dialogo.current?.showModal();
  };
  const cerrar = useCallback(() => dialogo.current?.close(), []);
  const total = galeria.length;
  const mover = useCallback((d: number) => setIndice((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    const onClose = () => setIndice(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    d.addEventListener("close", onClose);
    d.addEventListener("keydown", onKey);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("keydown", onKey);
    };
  }, [mover]);

  const foto = indice !== null ? galeria[indice] : null;

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {galeria.map((g, i) => (
          <li key={g.id} className="mb-3 break-inside-avoid sm:mb-4" data-reveal="zoom" style={{ "--retraso": `${(i % 4) * 80}ms` } as React.CSSProperties}>
            <button
              type="button"
              onClick={() => abrir(i)}
              className="group relative block w-full overflow-hidden rounded-3xl shadow-suave ring-1 ring-mar-100"
              aria-label={`Ampliar foto: ${g.alt}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                width={g.ancho}
                height={g.alto}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="h-auto w-full transition duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 grid place-items-center bg-mar-950/0 transition group-hover:bg-mar-950/35">
                <ZoomIn className="size-9 scale-50 text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100" aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        aria-label="Galería de fotos"
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-mar-950/90 backdrop:backdrop-blur-sm"
      >
        {foto && (
          <div
            className="relative flex h-full w-full items-center justify-center p-4 sm:p-10"
            onClick={(e) => e.target === e.currentTarget && cerrar()}
            onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (toque.current === null) return;
              const dx = e.changedTouches[0].clientX - toque.current;
              if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
              toque.current = null;
            }}
          >
            <figure className="relative flex max-h-full w-full max-w-5xl flex-col items-center">
              <Image
                key={foto.src}
                src={foto.src}
                alt={foto.alt}
                width={foto.ancho}
                height={foto.alto}
                sizes="100vw"
                className="max-h-[78vh] w-auto animate-[entrar_0.35s_both] rounded-3xl object-contain shadow-flotante"
              />
              <figcaption className="mt-4 text-center text-mar-100">
                {foto.alt} · <span className="tabular-nums">{(indice ?? 0) + 1} / {galeria.length}</span>
              </figcaption>
            </figure>
            <button type="button" onClick={cerrar} aria-label="Cerrar" className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25">
              <X className="size-6" />
            </button>
            <button type="button" onClick={() => mover(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25 sm:left-6">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" onClick={() => mover(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25 sm:right-6">
              <ChevronRight className="size-6" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
