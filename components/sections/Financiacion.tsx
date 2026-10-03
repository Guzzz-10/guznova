"use client";

import { useState } from "react";
import { autos } from "@/data/autos";
import { cn } from "@/lib/cn";
import { usd } from "@/lib/format";
import { waLink } from "@/lib/site";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const TNA = 0.085; // tasa de ejemplo en USD
const CUOTAS = [12, 24, 36, 48, 60];

function cuotaFrancesa(capital: number, n: number) {
  const r = TNA / 12;
  return (capital * r) / (1 - Math.pow(1 + r, -n));
}

const slider = (v: number, min: number, max: number) => ({
  ["--p" as string]: `${((v - min) / (max - min)) * 100}%`,
});

export function Financiacion() {
  const [precio, setPrecio] = useState(60000);
  const [entregaPct, setEntregaPct] = useState(30);
  const [cuotas, setCuotas] = useState(36);

  const entrega = Math.round((precio * entregaPct) / 100);
  const capital = precio - entrega;
  const cuota = cuotaFrancesa(capital, cuotas);
  const total = cuota * cuotas + entrega;

  return (
    <section id="financiacion" className="scroll-mt-16 bg-paper py-24 text-ink md:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:pt-6">
          <SectionHeading
            tone="light"
            kicker="Financiación"
            lines={["Tu próximo auto,", "en cuotas que cierran."]}
            sub="Simulá tu cuota en segundos. Trabajamos con bancos y financieras para conseguirte la mejor tasa, y tomamos tu usado como parte de pago."
          />
          <Reveal delay={0.2}>
            <ul className="mt-10 space-y-3 text-[15px] text-ink/70">
              {["Aprobación en el día", "Hasta 60 cuotas en dólares", "Tu usado como parte de pago"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-px w-6 bg-ink/40" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:p-9">
            <div className="space-y-8">
              <div>
                <label htmlFor="auto-sim" className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
                  Elegí un auto (opcional)
                </label>
                <select
                  id="auto-sim"
                  defaultValue=""
                  onChange={(e) => {
                    const a = autos.find((x) => x.id === e.target.value);
                    if (a) setPrecio(Math.min(150000, Math.max(10000, Math.round(a.precio / 500) * 500)));
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-ink/10 bg-paper px-4 text-[15px] outline-none transition-colors focus:border-ink/40"
                >
                  <option value="">Ingresar el precio manualmente</option>
                  {autos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.marca} {a.modelo} {a.version} — {usd(a.precio)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="precio-sim" className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
                    Precio del auto
                  </label>
                  <span className="text-lg font-medium tabular-nums">{usd(precio)}</span>
                </div>
                <input
                  id="precio-sim"
                  type="range"
                  className="range on-light mt-2"
                  min={10000}
                  max={150000}
                  step={500}
                  value={precio}
                  style={slider(precio, 10000, 150000)}
                  onChange={(e) => setPrecio(Number(e.target.value))}
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="entrega-sim" className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
                    Entrega · {entregaPct}%
                  </label>
                  <span className="text-lg font-medium tabular-nums">{usd(entrega)}</span>
                </div>
                <input
                  id="entrega-sim"
                  type="range"
                  className="range on-light mt-2"
                  min={0}
                  max={70}
                  step={5}
                  value={entregaPct}
                  style={slider(entregaPct, 0, 70)}
                  onChange={(e) => setEntregaPct(Number(e.target.value))}
                />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">Cantidad de cuotas</p>
                <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="Cantidad de cuotas">
                  {CUOTAS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={cuotas === c}
                      onClick={() => setCuotas(c)}
                      className={cn(
                        "h-11 rounded-xl border text-[15px] transition-all duration-500 ease-premium",
                        cuotas === c
                          ? "border-ink bg-ink text-paper"
                          : "border-ink/10 hover:border-ink/40",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-9 rounded-2xl bg-ink p-6 text-paper sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-paper/50">Tu cuota estimada</p>
              <p className="mt-2 flex items-baseline gap-2">
                <AnimatedNumber
                  value={cuota}
                  format={usd}
                  className="display text-[clamp(2.5rem,7vw,3.75rem)] tabular-nums"
                />
                <span className="text-paper/50">/ mes</span>
              </p>
              <div className="mt-5 flex justify-between border-t border-paper/10 pt-4 text-sm text-paper/60">
                <span>Financiás {usd(capital)}</span>
                <span>Total {usd(total)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xs text-xs leading-relaxed text-ink/45">
                Simulación orientativa con TNA {(TNA * 100).toFixed(1)}% en USD, sujeta a evaluación crediticia. No constituye una oferta.
              </p>
              <Button
                variant="light"
                external
                href={waLink(
                  `Hola GuzNova! Simulé una cuota: auto ${usd(precio)}, entrega ${usd(entrega)}, ${cuotas} cuotas de ~${usd(cuota)}. Quiero más info.`,
                )}
              >
                Solicitar
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
