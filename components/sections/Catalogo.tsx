"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { autos, marcas } from "@/data/autos";
import { cn } from "@/lib/cn";
import { usd } from "@/lib/format";
import { ease } from "@/lib/motion";
import { AutoCard } from "../AutoCard";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const PRECIO_TOPE = Math.ceil(Math.max(...autos.map((a) => a.precio)) / 5000) * 5000;
const PRECIO_MIN = 20000;
const ANIOS = [
  { label: "Todos", value: 0 },
  { label: "2020+", value: 2020 },
  { label: "2021+", value: 2021 },
  { label: "2022+", value: 2022 },
  { label: "2023+", value: 2023 },
];

function Pill({
  active,
  onClick,
  children,
  layoutId,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-500",
        active ? "text-ink" : "text-fg/70 hover:text-fg",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full bg-fg"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

export function Catalogo() {
  const [marca, setMarca] = useState("Todas");
  const [anioMin, setAnioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(PRECIO_TOPE);

  const filtrados = useMemo(
    () =>
      autos.filter(
        (a) =>
          (marca === "Todas" || a.marca === marca) &&
          a.anio >= anioMin &&
          a.precio <= precioMax,
      ),
    [marca, anioMin, precioMax],
  );

  const pct = ((precioMax - PRECIO_MIN) / (PRECIO_TOPE - PRECIO_MIN)) * 100;
  const hayFiltros = marca !== "Todas" || anioMin !== 0 || precioMax !== PRECIO_TOPE;

  return (
    <section id="catalogo" className="scroll-mt-16 py-24 md:py-40">
      <div className="container-x">
        <SectionHeading
          kicker="Catálogo"
          lines={["Encontrá el", "que va con vos."]}
          sub="Filtrá por marca, año y presupuesto. Todas las unidades se entregan revisadas y con garantía."
        />

        <Reveal className="mt-14 space-y-6 border-y border-line py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              {["Todas", ...marcas].map((m) => (
                <Pill key={m} active={marca === m} onClick={() => setMarca(m)} layoutId="pill-marca">
                  {m}
                </Pill>
              ))}
            </div>
            <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {ANIOS.map((y) => (
                <Pill key={y.value} active={anioMin === y.value} onClick={() => setAnioMin(y.value)} layoutId="pill-anio">
                  {y.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <label htmlFor="precio" className="flex items-baseline justify-between gap-4 text-sm text-muted sm:w-64">
              <span>Hasta</span>
              <AnimatedNumber
                value={precioMax}
                format={usd}
                className="text-base font-medium text-fg tabular-nums"
              />
            </label>
            <input
              id="precio"
              type="range"
              className="range sm:max-w-md"
              min={PRECIO_MIN}
              max={PRECIO_TOPE}
              step={5000}
              value={precioMax}
              style={{ ["--p" as string]: `${pct}%` }}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
            />
            <div className="flex items-center gap-4 sm:ml-auto">
              <p className="text-sm text-muted" aria-live="polite">
                {filtrados.length} {filtrados.length === 1 ? "auto" : "autos"}
              </p>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={() => {
                    setMarca("Todas");
                    setAnioMin(0);
                    setPrecioMax(PRECIO_TOPE);
                  }}
                  className="text-sm text-accent underline-offset-4 hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtrados.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.7, ease }}
              >
                <AutoCard auto={a} scope="cat" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtrados.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="py-24 text-center text-muted"
          >
            No encontramos autos con esos filtros. Probá ampliando el presupuesto o escribinos y te ayudamos a buscarlo.
          </motion.p>
        )}
      </div>
    </section>
  );
}
