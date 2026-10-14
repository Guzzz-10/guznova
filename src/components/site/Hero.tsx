"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, Gauge } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Counter } from "@/components/ui/Motion";
import { formatKm, formatPrice } from "@/lib/format";

type HeroCar = {
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  km: number;
  cover: { url: string; alt: string } | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({
  car,
  whatsappHref,
  stats,
}: {
  car: HeroCar | null;
  whatsappHref: string;
  stats: { sold: number; years: number; satisfaction: number };
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);

  const words = ["Tu", "próximo", "auto,"];

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-24 sm:pt-32">
      {/* Fondo */}
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b" aria-hidden />
      <motion.div
        style={{ scale: glowScale }}
        className="absolute -top-40 left-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-nova-500/20 blur-[120px] sm:left-[70%]"
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" aria-hidden />

      <div className="container grid items-center gap-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow rounded-full border border-nova-500/20 bg-nova-500/10 px-3 py-1.5"
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Autos revisados y con garantía
          </motion.span>

          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            <span className="sr-only">Tu próximo auto, sin vueltas.</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <motion.span
                  key={w}
                  className="mr-[0.25em] inline-block"
                  initial={{ opacity: 0, y: 40, rotateX: -40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.08 }}
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="inline-block bg-gradient-to-r from-nova-300 via-nova-500 to-nova-600 bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-gradient-pan"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.38 }}
              >
                sin vueltas.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg"
          >
            Usados seleccionados, con revisión mecánica completa, financiación a tu medida y tomamos tu auto como parte
            de pago. Consultá por WhatsApp y te respondemos al toque.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.62 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/autos" className="btn-primary group !py-3.5 text-base">
              Ver catálogo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-3.5 text-base">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              Consultar por WhatsApp
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6"
          >
            <div className="flex flex-col">
              <dt className="text-xs text-ink-400 sm:text-sm">autos vendidos</dt>
              <dd className="order-first font-display text-2xl font-bold text-white sm:text-3xl">
                <Counter to={stats.sold} prefix="+" />
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-ink-400 sm:text-sm">años en el rubro</dt>
              <dd className="order-first font-display text-2xl font-bold text-white sm:text-3xl">
                <Counter to={stats.years} />
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-ink-400 sm:text-sm">clientes satisfechos</dt>
              <dd className="order-first font-display text-2xl font-bold text-white sm:text-3xl">
                <Counter to={stats.satisfaction} suffix="%" />
              </dd>
            </div>
          </motion.dl>
        </div>

        {car && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.25 }}
            className="relative"
          >
            <motion.div style={{ y: imgY }}>
              <Link
                href={`/autos/${car.slug}`}
                className="group relative block overflow-hidden rounded-[28px] border border-white/10 bg-ink-850 shadow-2xl"
              >
                <div className="relative aspect-[16/11]">
                  {car.cover && (
                    <Image
                      src={car.cover.url}
                      alt={car.cover.alt || `${car.brand} ${car.model}`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 600px, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-nova-400">Destacado</p>
                    <p className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-sm text-ink-300">
                      {car.version} · {car.year}
                    </p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-nova-500 text-ink-950 transition group-hover:scale-110">
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Chips flotantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 1 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
              className="absolute -top-4 right-4 rounded-2xl border border-white/10 bg-ink-900/90 px-4 py-3 shadow-xl backdrop-blur sm:-right-4"
            >
              <p className="text-[11px] uppercase tracking-wider text-ink-400">Precio</p>
              <p className="font-display text-xl font-bold text-white">{formatPrice(car.price)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ opacity: { delay: 1.2 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
              className="absolute -left-3 top-1/3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/90 px-4 py-3 shadow-xl backdrop-blur sm:flex lg:-left-8"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-nova-500/15 text-nova-400">
                <Gauge className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">Kilometraje</p>
                <p className="font-semibold text-white">{formatKm(car.km)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
