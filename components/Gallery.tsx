"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Auto } from "@/data/autos";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { CarImage } from "./ui/CarImage";

type Props = {
  auto: Auto;
  layoutId?: string;
  className?: string;
  priority?: boolean;
};

export function Gallery({ auto, layoutId, className, priority }: Props) {
  const [i, setI] = useState(0);
  const label = `${auto.marca} ${auto.modelo}`;

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        layoutId={layoutId}
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface",
          className,
        )}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <CarImage
              src={auto.fotos[i]}
              alt={`${label} ${auto.version} — foto ${i + 1}`}
              label={label}
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={priority && i === 0}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {auto.fotos.map((f, idx) => (
          <button
            key={f}
            type="button"
            aria-label={`Ver foto ${idx + 1}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={cn(
              "relative aspect-[16/10] overflow-hidden rounded-xl border bg-surface transition-all duration-500 ease-premium",
              idx === i
                ? "border-accent opacity-100"
                : "border-line opacity-55 hover:opacity-90",
            )}
          >
            <CarImage src={f} alt="" sizes="200px" />
          </button>
        ))}
      </div>
    </div>
  );
}
