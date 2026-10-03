"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { autos } from "@/data/autos";
import { AutoCard } from "../AutoCard";
import { SectionHeading } from "../ui/SectionHeading";

const destacados = autos.filter((a) => a.destacado);

export function Destacados() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [vh, setVh] = useState(800);

  // Cuánto hay que desplazar el carril y cuánto scroll vertical "consume"
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
      setVh(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  const header = (
    <div className="container-x">
      <SectionHeading
        kicker="Selección GuzNova"
        lines={["Unidades que", "valen el viaje."]}
        sub="Una selección corta, revisada a fondo. Deslizá para recorrerla."
      />
    </div>
  );

  const cards = destacados.map((a) => (
    <div key={a.id} className="w-[78vw] shrink-0 sm:w-[44vw] lg:w-[30vw] xl:w-[26vw]">
      <AutoCard auto={a} scope="dest" sizes="(min-width: 1024px) 30vw, 80vw" />
    </div>
  ));

  // Reduced motion: carril con scroll nativo (sin scroll-jacking)
  if (reduce) {
    return (
      <section id="destacados" className="py-24">
        {header}
        <div className="no-scrollbar mt-12 flex snap-x gap-5 overflow-x-auto px-5 sm:px-8">
          {destacados.map((a) => (
            <div key={a.id} className="w-[78vw] shrink-0 snap-center sm:w-[44vw] lg:w-[30vw]">
              <AutoCard auto={a} scope="dest" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="destacados"
      ref={sectionRef}
      style={{ height: travel + vh * 1.1 }}
      className="relative"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-10 overflow-hidden pt-16 lg:gap-14">
        {header}
        <div>
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex w-max gap-5 px-5 will-change-transform sm:gap-6 sm:px-8 lg:px-12"
          >
            {cards}
            <div className="w-5 shrink-0 sm:w-8 lg:w-12" aria-hidden />
          </motion.div>
          <div className="container-x mt-8">
            <div className="h-px w-full bg-line">
              <motion.div
                className="h-px origin-left bg-accent"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
