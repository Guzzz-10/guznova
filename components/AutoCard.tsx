"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Auto } from "@/data/autos";
import { km, usd } from "@/lib/format";
import { imgLayoutId, useAutoModal } from "./AutoModal";
import { CarImage } from "./ui/CarImage";

type Props = { auto: Auto; scope: string; sizes?: string };

export function AutoCard({ auto, scope, sizes }: Props) {
  const { open } = useAutoModal();
  const label = `${auto.marca} ${auto.modelo}`;

  return (
    <button
      type="button"
      onClick={() => open(auto, scope)}
      className="group block w-full text-left"
      aria-label={`Ver ${label} ${auto.version}`}
    >
      <motion.div
        layoutId={imgLayoutId(scope, auto.id)}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.07]">
          <CarImage
            src={auto.fotos[0]}
            alt={`${label} ${auto.version}`}
            label={label}
            sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"}
          />
        </div>

        {/* Info extra al hacer hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-14 opacity-0 transition-all duration-700 ease-premium group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-end justify-between gap-3">
            <p className="text-[13px] leading-snug text-white/85">
              {auto.combustible} · {auto.transmision}
              <br />
              <span className="text-white/60">{auto.motor}</span>
            </p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{auto.marca}</p>
          <h3 className="mt-1 truncate text-lg font-medium tracking-tight">
            {auto.modelo} <span className="text-muted">{auto.version}</span>
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {auto.anio} · {km(auto.km)} · {auto.combustible}
          </p>
        </div>
        <p className="shrink-0 pt-4 text-lg font-medium tracking-tight">{usd(auto.precio)}</p>
      </div>
    </button>
  );
}
