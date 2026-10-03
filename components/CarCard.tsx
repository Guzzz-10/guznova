"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Auto } from "@/data/autos";
import { nombre } from "@/data/autos";
import { km, usd } from "@/lib/format";
import { useDetalle } from "./DetalleProvider";
import { SafeImage } from "./ui/SafeImage";

type Props = { auto: Auto; ctx: string; dark?: boolean; sizes?: string };

export function CarCard({ auto, ctx, dark = false, sizes = "(min-width:1024px) 33vw, (min-width:640px) 50vw, 90vw" }: Props) {
  const { open } = useDetalle();
  return (
    <article className="group">
      <button
        onClick={() => open(auto, ctx)}
        className="block w-full text-left"
        aria-label={`Ver detalle de ${nombre(auto)} ${auto.version}`}
      >
        <motion.div
          layoutId={`${ctx}-img-${auto.slug}`}
          className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${dark ? "bg-white/5" : "bg-ink/5"}`}
          style={{ borderRadius: 16 }}
        >
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]">
            <SafeImage src={auto.fotos[0]} alt={`${nombre(auto)} ${auto.version}`} sizes={sizes} label={nombre(auto)} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Info extra al hacer hover */}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between p-4 text-white opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-xs tracking-wide">{auto.potencia} · {auto.transmision.split(" ")[0]}</span>
            <span className="flex items-center gap-1 text-xs font-medium">Ver detalle <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} /></span>
          </div>
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-md ${dark ? "bg-black/40 text-white" : "bg-paper/80 text-ink"}`}>
            {auto.combustible}
          </span>
        </motion.div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className={`text-lg font-semibold tracking-[-0.03em] ${dark ? "text-white" : "text-ink"}`}>{nombre(auto)}</h3>
            <p className={`text-sm ${dark ? "text-white/55" : "text-mute"}`}>{auto.version} · {auto.anio} · {km(auto.km)}</p>
          </div>
          <p className={`shrink-0 text-base font-semibold tracking-tight ${dark ? "text-white" : "text-ink"}`}>{usd(auto.precio)}</p>
        </div>
      </button>
    </article>
  );
}
