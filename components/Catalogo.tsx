"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { autos, marcas } from "@/data/autos";
import { ease } from "@/lib/motion";
import { CarCard } from "./CarCard";
import { Button } from "./ui/Button";
import { SectionHeading } from "./ui/SectionHeading";

type Opt = { label: string; test: (n: number) => boolean };
const precios: Opt[] = [
  { label: "Todos", test: () => true },
  { label: "Hasta USD 50.000", test: (n) => n <= 50000 },
  { label: "USD 50.000 – 80.000", test: (n) => n > 50000 && n <= 80000 },
  { label: "Más de USD 80.000", test: (n) => n > 80000 },
];
const anios: Opt[] = [
  { label: "Todos", test: () => true },
  { label: "Desde 2020", test: (n) => n >= 2020 },
  { label: "Desde 2022", test: (n) => n >= 2022 },
  { label: "Desde 2023", test: (n) => n >= 2023 },
];

function Group({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (i: number) => void }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <p className="mb-2.5 text-xs text-mute">{label}</p>
      <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={label}>
        {options.map((o, i) => (
          <button
            key={o}
            onClick={() => onChange(i)}
            aria-pressed={i === value}
            className={`relative shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${i === value ? "border-transparent text-paper" : "border-ink/12 text-ink/70 hover:border-ink/40"}`}
          >
            {i === value && (
              <motion.span layoutId={`pill-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease }} />
            )}
            <span className="relative">{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Catalogo() {
  const [m, setM] = useState(0);
  const [p, setP] = useState(0);
  const [y, setY] = useState(0);
  const opcionesMarca = useMemo(() => ["Todas", ...marcas], []);

  const lista = useMemo(
    () =>
      autos.filter(
        (a) => (m === 0 || a.marca === opcionesMarca[m]) && precios[p].test(a.precio) && anios[y].test(a.anio),
      ),
    [m, p, y, opcionesMarca],
  );
  const reset = () => { setM(0); setP(0); setY(0); };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 md:px-8 md:py-32">
      <SectionHeading eyebrow="Catálogo" title="Encontrá el tuyo">
        Todas nuestras unidades están peritadas, con documentación al día y listas para transferir.
      </SectionHeading>

      <div className="mt-12 grid gap-6 md:mt-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
        <Group label="Marca" options={opcionesMarca} value={m} onChange={setM} />
        <Group label="Precio" options={precios.map((o) => o.label)} value={p} onChange={setP} />
        <Group label="Año" options={anios.map((o) => o.label)} value={y} onChange={setY} />
      </div>

      <p className="mt-8 text-sm text-mute" aria-live="polite">
        {lista.length} {lista.length === 1 ? "auto" : "autos"}
      </p>

      <motion.div layout className="mt-4 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {lista.map((a) => (
            <motion.div
              key={a.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease }}
            >
              <CarCard auto={a} ctx="cat" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {lista.length === 0 && (
        <div className="mt-10 flex flex-col items-start gap-5 rounded-2xl border border-ink/10 p-8">
          <p className="text-lg font-medium tracking-tight">No encontramos autos con esos filtros.</p>
          <p className="text-mute">Probá ampliar la búsqueda o contanos qué buscás y te lo conseguimos.</p>
          <Button onClick={reset} variant="outline">Limpiar filtros</Button>
        </div>
      )}
    </section>
  );
}
