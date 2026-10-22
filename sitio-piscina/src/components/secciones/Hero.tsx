import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ContenidoHero } from "@/lib/contenido/tipos";
import { Burbujas } from "@/components/ui/Burbujas";
import { OlasAnimadas } from "@/components/ui/Ola";
import { PelotaPlaya, Salvavidas } from "@/components/ui/Decoracion";

export function Hero({ hero, ciudad }: { hero: ContenidoHero; ciudad: string }) {
  return (
    <section id="inicio" aria-labelledby="titulo-hero" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-mar-900 pt-24 pb-32 sm:pb-40">
      {/* Fondo: video si está configurado, si no la foto */}
      <div className="absolute inset-0 -z-20">
        {hero.videoUrl ? (
          <video className="size-full object-cover" autoPlay muted loop playsInline poster={hero.imagenUrl} aria-hidden="true">
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image src={hero.imagenUrl} alt="" fill preload sizes="100vw" className="zoom-lento object-cover" />
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-mar-950/80 via-mar-900/55 to-agua-700/50" />
      <div aria-hidden="true" className="causticas absolute inset-0 -z-10 mix-blend-overlay" />
      <Burbujas className="-z-10" />

      <Salvavidas className="absolute top-28 right-[6%] hidden size-28 animate-flotar drop-shadow-xl lg:block" style={{ "--giro": "-12deg" } as React.CSSProperties} />
      <PelotaPlaya className="absolute right-[18%] bottom-44 hidden size-20 animate-flotar drop-shadow-xl [animation-delay:-3s] lg:block" />

      <div className="contenedor relative">
        <div className="max-w-3xl">
          <p data-reveal className="chip bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md">
            {hero.chip} en {ciudad}
          </p>
          <h1
            id="titulo-hero"
            data-reveal
            style={{ "--retraso": "100ms" } as React.CSSProperties}
            className="mt-5 font-display text-5xl leading-[0.95] font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgb(7_26_51_/_0.45)] sm:text-7xl lg:text-8xl"
          >
            {hero.titulo} <span className="subrayado-ola text-sol-300">{hero.destacado}</span>
          </h1>
          <p
            data-reveal
            style={{ "--retraso": "200ms" } as React.CSSProperties}
            className="mt-6 max-w-xl text-lg text-mar-50 sm:text-xl"
          >
            {hero.subtitulo}
          </p>
          <div data-reveal style={{ "--retraso": "300ms" } as React.CSSProperties} className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/#suscripcion" className="btn btn-coral text-xl sm:px-8">
              Hacete socio <span aria-hidden="true">🏊</span>
            </Link>
            <Link href="/#clases" className="btn btn-vidrio text-xl sm:px-8">
              Ver clases
            </Link>
          </div>
          <ul
            data-reveal
            style={{ "--retraso": "400ms" } as React.CSSProperties}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/90 sm:text-base"
          >
            {hero.puntos.map((p) => (
              <li key={p} className="flex items-center gap-2">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href="#piscinas"
        className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-sm font-semibold text-white/80 transition hover:text-white sm:bottom-32 sm:flex"
      >
        Deslizá
        <ChevronDown className="size-6 animate-bounce" aria-hidden="true" />
      </a>

      <OlasAnimadas className="text-white" />
    </section>
  );
}
