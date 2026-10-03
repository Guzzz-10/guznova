"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import type { Auto } from "@/data/autos";
import { nombre } from "@/data/autos";
import { usd } from "@/lib/format";
import { ease } from "@/lib/motion";
import { Button } from "./ui/Button";
import { SafeImage } from "./ui/SafeImage";
import { SplitText } from "./ui/SplitText";

export function Hero({ auto }: { auto: Auto }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-white">
      <motion.div className="absolute inset-x-0 -top-[8%] h-[116%]" style={{ y: imgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease }}
        >
          <SafeImage src={auto.fotos[0]} alt={`${nombre(auto)} ${auto.version}`} sizes="100vw" priority quiet />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/45" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.5 }}
          className="mb-5 text-xs font-medium tracking-[0.25em] text-white/70 uppercase"
        >
          Automotora · Rosario
        </motion.p>

        <h1 className="max-w-5xl text-[clamp(2.9rem,10.5vw,9rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance">
          <SplitText text="Manejá lo que siempre soñaste." delay={0.5} />
        </h1>

        <div className="mt-9 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 1.5 }}
            className="flex flex-wrap gap-3"
          >
            <Button href="#catalogo" variant="light">Ver catálogo</Button>
            <Button href="#financiacion" variant="outline-light">Simular cuota</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 1.7 }}
            className="max-w-xs rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.25em] text-accent uppercase">Auto destacado</p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight">{nombre(auto)} {auto.version}</p>
            <p className="text-sm text-white/65">{auto.anio} · {usd(auto.precio)}</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 md:block"
      >
        <ArrowDown strokeWidth={1.25} className="h-5 w-5 animate-bounce" />
      </motion.div>
    </section>
  );
}
