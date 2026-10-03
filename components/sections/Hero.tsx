"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { autos } from "@/data/autos";
import { km, usd } from "@/lib/format";
import { ease } from "@/lib/motion";
import { waLink } from "@/lib/site";
import { useAutoModal } from "../AutoModal";
import { Button } from "../ui/Button";
import { CarImage } from "../ui/CarImage";
import { SplitText } from "../ui/SplitText";

const destacado = autos[0];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { open } = useAutoModal();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "13%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label="Auto destacado"
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden"
    >
      {/* Imagen con parallax + zoom-out de entrada */}
      <motion.div
        className="absolute inset-x-0 -top-[15%] -z-10 h-[115%] will-change-transform"
        style={{ y: imgY, scale: imgScale }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.22 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease }}
        >
          <CarImage
            src={destacado.fotos[0]}
            alt={`${destacado.marca} ${destacado.modelo} ${destacado.version}`}
            sizes="100vw"
            bare
            priority
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/35 to-bg/55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x pb-10 pt-32 sm:pb-14"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.3 }}
          className="mb-6 text-[12px] font-medium uppercase tracking-[0.26em] text-accent"
        >
          Automotora · Rosario
        </motion.p>

        <SplitText
          as="h1"
          onMount
          delay={0.45}
          stagger={0.14}
          lines={["Autos que se", "sienten distintos."]}
          className="display max-w-5xl text-[clamp(2.9rem,10.5vw,8.5rem)]"
        />

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.05 }}
          className="mt-7 max-w-md text-[17px] leading-relaxed text-fg/70"
        >
          Usados premium elegidos uno por uno, con historial verificado y atención de persona a persona.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.2 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Button href="/#catalogo">
            Ver catálogo
          </Button>
          <Button
            external
            href={waLink("Hola GuzNova! Quería consultar por un auto.")}
            variant="ghost"
            arrow={false}
          >
            Hablar por WhatsApp
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 1.5 }}
          className="mt-12 flex items-end justify-between gap-6 border-t border-white/10 pt-5"
        >
          <button
            type="button"
            onClick={() => open(destacado, "hero")}
            className="group text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Destacado de la semana</p>
            <p className="mt-1.5 text-[15px] font-medium tracking-tight transition-colors duration-500 group-hover:text-accent">
              {destacado.marca} {destacado.modelo} {destacado.version}
              <span className="font-normal text-fg/60">
                {" "}· {destacado.anio} · {km(destacado.km)} · {usd(destacado.precio)}
              </span>
            </p>
          </button>
          <ChevronDown
            className="hidden h-5 w-5 animate-bounce text-fg/50 sm:block"
            strokeWidth={1.25}
            aria-hidden
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
