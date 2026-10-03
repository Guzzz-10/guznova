"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Auto } from "@/data/autos";
import { nombre } from "@/data/autos";
import { km, usd } from "@/lib/format";
import { ease } from "@/lib/motion";
import { waLink } from "@/lib/site";
import { Button } from "./ui/Button";
import { SafeImage } from "./ui/SafeImage";

export function DetalleBody({ auto, layoutId }: { auto: Auto; layoutId?: string }) {
  const [idx, setIdx] = useState(0);
  const specs = [
    ["Año", String(auto.anio)],
    ["Kilometraje", km(auto.km)],
    ["Combustible", auto.combustible],
    ["Transmisión", auto.transmision],
    ["Potencia", auto.potencia],
    ["Color", auto.color],
  ];

  return (
    <div>
      <motion.div
        layoutId={layoutId}
        className="relative aspect-[4/3] overflow-hidden bg-ink/5 sm:aspect-[16/9] md:rounded-t-3xl"
        style={{ borderRadius: layoutId ? 16 : undefined }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <SafeImage src={auto.fotos[idx]} alt={`${nombre(auto)} foto ${idx + 1}`} sizes="(min-width:1024px) 1000px, 100vw" priority label={nombre(auto)} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-2.5 overflow-x-auto px-5 pt-4 no-scrollbar md:px-10">
        {auto.fotos.map((f, i) => (
          <button
            key={f + i}
            onClick={() => setIdx(i)}
            aria-label={`Ver foto ${i + 1}`}
            aria-current={i === idx}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink/5 transition-all duration-500 ${i === idx ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"}`}
          >
            <SafeImage src={f} alt="" sizes="96px" />
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.25 }}
        className="grid gap-10 px-5 py-8 md:grid-cols-[1.2fr_1fr] md:px-10 md:py-12"
      >
        <div>
          <p className="text-xs tracking-[0.22em] text-accent uppercase">{auto.marca}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">{auto.modelo} <span className="text-mute">{auto.version}</span></h2>
          <p className="mt-6 max-w-lg leading-relaxed text-mute">{auto.descripcion}</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink/10 pt-6 sm:grid-cols-3">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-mute">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6">
          <p className="text-xs text-mute">Precio contado</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.045em]">{usd(auto.precio)}</p>
          <p className="mt-2 text-xs text-mute">Aceptamos tu usado como parte de pago.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button href={waLink(`Hola GuzNova! Me interesa el ${nombre(auto)} ${auto.version} ${auto.anio}. ¿Sigue disponible?`)} external className="w-full">
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Consultar por WhatsApp
            </Button>
            <Button href={waLink(`Hola! Quiero coordinar una visita para ver el ${nombre(auto)} ${auto.version}.`)} external variant="outline" className="w-full">
              Coordinar visita
            </Button>
          </div>
        </aside>
      </motion.div>
    </div>
  );
}
