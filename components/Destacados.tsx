"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Auto } from "@/data/autos";
import { CarCard } from "./CarCard";
import { SectionHeading } from "./ui/SectionHeading";

/** Scroll horizontal controlado por el scroll vertical (sticky + transform). */
export function Destacados({ autos }: { autos: Auto[] }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const cards = autos.map((a) => (
    <div key={a.slug} className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw] xl:w-[26vw]">
      <CarCard auto={a} ctx="dest" dark sizes="(min-width:1024px) 30vw, 80vw" />
    </div>
  ));

  const head = (
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <SectionHeading eyebrow="Selección GuzNova" title="Autos destacados" dark>
        Una curaduría de las unidades que más nos enorgullecen. Deslizá para recorrerlas.
      </SectionHeading>
    </div>
  );

  if (reduce) {
    return (
      <section id="destacados" className="scroll-mt-16 bg-ink py-24 text-white">
        {head}
        <div className="no-scrollbar mt-12 flex snap-x gap-6 overflow-x-auto px-5 md:px-8">{cards}</div>
      </section>
    );
  }

  return (
    <section
      id="destacados"
      ref={section}
      className="relative bg-ink text-white"
      style={{ height: dist ? `calc(100svh + ${dist}px)` : "300svh" }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-10 overflow-hidden py-16">
        {head}
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 px-5 will-change-transform md:gap-8 md:px-8">
          {cards}
        </motion.div>
        <div className="mx-auto h-px w-full max-w-7xl px-5 md:px-8">
          <div className="h-px w-full bg-white/15">
            <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
