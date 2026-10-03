"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { num } from "@/lib/format";
import { waLink } from "@/lib/site";
import { Button } from "./ui/Button";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

const TNA = 0.089; // tasa de referencia para la demo
const planes = [12, 24, 36, 48, 60];

function Animated({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 90, damping: 22 });
  const text = useTransform(spring, (v) => num(v));
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{text}</motion.span>;
}

function Slider({ label, value, min, max, step, onChange, display }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; display: string }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <label className="text-sm text-white/60">{label}</label>
        <span className="text-lg font-medium tracking-tight">{display}</span>
      </div>
      <input
        type="range" className="range" min={min} max={max} step={step} value={value}
        style={{ ["--p" as string]: `${p}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}

export function Financiacion() {
  const [precio, setPrecio] = useState(60000);
  const [entregaPct, setEntregaPct] = useState(30);
  const [cuotas, setCuotas] = useState(36);

  const entrega = Math.round((precio * entregaPct) / 100);
  const monto = precio - entrega;
  const r = TNA / 12;
  const cuota = monto * r / (1 - Math.pow(1 + r, -cuotas));

  return (
    <section id="financiacion" className="scroll-mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow="Financiación" title="Tu cuota, sin sorpresas." dark>
            Armá un plan en segundos. Es una referencia: un asesor te confirma la tasa final según tu perfil.
          </SectionHeading>
        </div>

        <Reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <div className="space-y-9">
            <Slider label="Precio del auto" value={precio} min={15000} max={150000} step={1000} onChange={setPrecio} display={`USD ${num(precio)}`} />
            <Slider label="Entrega inicial" value={entregaPct} min={10} max={70} step={5} onChange={setEntregaPct} display={`${entregaPct}% · USD ${num(entrega)}`} />
            <div>
              <p className="mb-4 text-sm text-white/60">Cantidad de cuotas</p>
              <div className="flex flex-wrap gap-2">
                {planes.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCuotas(n)}
                    aria-pressed={n === cuotas}
                    className={`relative rounded-full border px-5 py-2 text-sm transition-colors duration-300 ${n === cuotas ? "border-transparent text-ink" : "border-white/20 text-white/70 hover:border-white/60"}`}
                  >
                    {n === cuotas && <motion.span layoutId="cuotas-pill" className="absolute inset-0 rounded-full bg-white" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />}
                    <span className="relative">{n}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-sm text-white/60">Cuota mensual estimada</p>
            <p className="mt-2 text-6xl font-semibold tracking-[-0.05em] tabular-nums md:text-7xl">
              <span className="text-3xl text-accent md:text-4xl">USD </span><Animated value={cuota} />
            </p>
            <p className="mt-3 text-xs text-white/45">
              {cuotas} cuotas sobre USD {num(monto)} · TNA de referencia {(TNA * 100).toFixed(1)}%. Sujeto a aprobación crediticia.
            </p>
            <div className="mt-7">
              <Button
                href={waLink(`Hola GuzNova! Simulé un plan: auto de USD ${num(precio)}, entrega ${entregaPct}%, ${cuotas} cuotas (≈ USD ${num(cuota)}/mes). Quiero avanzar.`)}
                external variant="light"
              >
                Quiero este plan
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
