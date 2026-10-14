"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SearchX, SlidersHorizontal, X } from "lucide-react";
import { CarCard } from "./CarCard";
import type { CarCardData, CatalogFilters, SortKey } from "@/lib/cars";
import { FUELS, FUEL_LABEL, TRANSMISSIONS, TRANSMISSION_LABEL } from "@/lib/constants";
import { formatKm, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

type Options = { brands: string[]; models: Record<string, string[]>; years: number[] };
type FilterState = Record<Exclude<keyof CatalogFilters, "orden">, string> & { orden: SortKey };

const KM_PRESETS = [20000, 50000, 80000, 100000, 150000];

function toState(f: CatalogFilters): FilterState {
  const s = (v: string | number | undefined) => (v === undefined ? "" : String(v));
  return {
    marca: s(f.marca),
    modelo: s(f.modelo),
    desde: s(f.desde),
    hasta: s(f.hasta),
    pmin: s(f.pmin),
    pmax: s(f.pmax),
    kmmax: s(f.kmmax),
    combustible: s(f.combustible),
    caja: s(f.caja),
    orden: f.orden,
  };
}

const EMPTY: FilterState = {
  marca: "",
  modelo: "",
  desde: "",
  hasta: "",
  pmin: "",
  pmax: "",
  kmmax: "",
  combustible: "",
  caja: "",
  orden: "recientes",
};

export function CatalogView({
  cars,
  filters,
  options,
  sorts,
}: {
  cars: CarCardData[];
  filters: CatalogFilters;
  options: Options;
  sorts: Record<SortKey, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<FilterState>(() => toState(filters));
  const [drawer, setDrawer] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typing = useRef(false);

  // Si la URL cambia desde afuera (ej. botón atrás), sincronizamos el formulario
  // (salvo que el usuario esté escribiendo un precio).
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    if (!typing.current) setState(toState(filters));
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function push(next: FilterState) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "orden" && v === "recientes")) qs.set(k, v);
    }
    const url = qs.size ? `${pathname}?${qs}` : pathname;
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function update(patch: Partial<FilterState>, delay = 0) {
    const next = { ...state, ...patch };
    if (patch.marca !== undefined && patch.marca !== state.marca) next.modelo = "";
    setState(next);
    clearTimeout(debounce.current);
    typing.current = delay > 0;
    if (delay) {
      debounce.current = setTimeout(() => {
        typing.current = false;
        push(next);
      }, delay);
    } else push(next);
  }

  const activeChips = useMemo(() => {
    const chips: { key: keyof FilterState; label: string }[] = [];
    if (state.marca) chips.push({ key: "marca", label: state.marca });
    if (state.modelo) chips.push({ key: "modelo", label: state.modelo });
    if (state.desde) chips.push({ key: "desde", label: `Desde ${state.desde}` });
    if (state.hasta) chips.push({ key: "hasta", label: `Hasta ${state.hasta}` });
    if (state.pmin) chips.push({ key: "pmin", label: `Mín. USD ${formatNumber(+state.pmin)}` });
    if (state.pmax) chips.push({ key: "pmax", label: `Máx. USD ${formatNumber(+state.pmax)}` });
    if (state.kmmax) chips.push({ key: "kmmax", label: `Hasta ${formatKm(+state.kmmax)}` });
    if (state.combustible) chips.push({ key: "combustible", label: FUEL_LABEL[state.combustible as keyof typeof FUEL_LABEL] });
    if (state.caja) chips.push({ key: "caja", label: TRANSMISSION_LABEL[state.caja as keyof typeof TRANSMISSION_LABEL] });
    return chips;
  }, [state]);

  const clearAll = () => update({ ...EMPTY, orden: state.orden });

  const filtersForm = (
    <FiltersForm state={state} options={options} update={update} onClear={clearAll} hasActive={activeChips.length > 0} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Filtros escritorio */}
      <aside className="hidden lg:block" aria-label="Filtros">
        <div className="card-surface sticky top-28 p-5">{filtersForm}</div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-300" aria-live="polite">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Buscando…
              </span>
            ) : (
              <>
                <strong className="text-white">{cars.length}</strong> {cars.length === 1 ? "auto encontrado" : "autos encontrados"}
              </>
            )}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="btn-ghost flex-1 !py-2.5 lg:hidden"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtros
              {activeChips.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-nova-500 px-1 text-[11px] font-bold text-ink-950">
                  {activeChips.length}
                </span>
              )}
            </button>
            <label className="sr-only" htmlFor="orden">
              Ordenar por
            </label>
            <select
              id="orden"
              value={state.orden}
              onChange={(e) => update({ orden: e.target.value as SortKey })}
              className="field flex-1 !py-2.5 sm:w-56 sm:flex-none"
            >
              {Object.entries(sorts).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeChips.length > 0 && (
          <ul className="mb-6 flex flex-wrap gap-2" aria-label="Filtros activos">
            {activeChips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => update({ [c.key]: "" } as Partial<FilterState>)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-nova-500/30 bg-nova-500/10 px-3 py-1.5 text-xs font-medium text-nova-200 transition hover:bg-nova-500/20"
                  aria-label={`Quitar filtro ${c.label}`}
                >
                  {c.label} <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="px-2 py-1.5 text-xs font-medium text-ink-400 underline-offset-2 hover:text-white hover:underline">
                Limpiar todo
              </button>
            </li>
          </ul>
        )}

        <div className={cn("transition-opacity duration-300", pending && "opacity-50")}>
          {cars.length > 0 ? (
            <motion.ul layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {cars.map((car, i) => (
                  <motion.li
                    key={car.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <CarCard car={car} priority={i < 3} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
              <SearchX className="h-10 w-10 text-ink-500" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-white">No encontramos autos con esos filtros</p>
              <p className="mt-1 text-sm text-ink-400">Probá ampliando la búsqueda o escribinos: conseguimos el auto que buscás.</p>
              <button type="button" onClick={clearAll} className="btn-primary mt-6">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} count={cars.length} pending={pending}>
        {filtersForm}
      </MobileDrawer>
    </div>
  );
}

function FiltersForm({
  state,
  options,
  update,
  onClear,
  hasActive,
}: {
  state: FilterState;
  options: Options;
  update: (p: Partial<FilterState>, delay?: number) => void;
  onClear: () => void;
  hasActive: boolean;
}) {
  const models = state.marca ? options.models[state.marca] ?? [] : [];
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">Filtrar</h2>
        {hasActive && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-nova-400 hover:text-nova-300">
            Limpiar
          </button>
        )}
      </div>

      <div>
        <label htmlFor="f-marca" className="field-label">
          Marca
        </label>
        <select id="f-marca" className="field" value={state.marca} onChange={(e) => update({ marca: e.target.value })}>
          <option value="">Todas las marcas</option>
          {options.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-modelo" className="field-label">
          Modelo
        </label>
        <select
          id="f-modelo"
          className="field disabled:opacity-50"
          value={state.modelo}
          disabled={!state.marca}
          onChange={(e) => update({ modelo: e.target.value })}
        >
          <option value="">{state.marca ? "Todos los modelos" : "Elegí una marca primero"}</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="field-label">Año</legend>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Año desde" className="field" value={state.desde} onChange={(e) => update({ desde: e.target.value })}>
            <option value="">Desde</option>
            {[...options.years].reverse().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select aria-label="Año hasta" className="field" value={state.hasta} onChange={(e) => update({ hasta: e.target.value })}>
            <option value="">Hasta</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Precio (USD)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Precio mínimo en dólares"
            inputMode="numeric"
            placeholder="Mínimo"
            className="field"
            value={state.pmin}
            onChange={(e) => update({ pmin: e.target.value.replace(/\D/g, "") }, 600)}
          />
          <input
            aria-label="Precio máximo en dólares"
            inputMode="numeric"
            placeholder="Máximo"
            className="field"
            value={state.pmax}
            onChange={(e) => update({ pmax: e.target.value.replace(/\D/g, "") }, 600)}
          />
        </div>
      </fieldset>

      <div>
        <label htmlFor="f-km" className="field-label">
          Kilometraje máximo
        </label>
        <select id="f-km" className="field" value={state.kmmax} onChange={(e) => update({ kmmax: e.target.value })}>
          <option value="">Cualquiera</option>
          {KM_PRESETS.map((k) => (
            <option key={k} value={k}>
              Hasta {formatKm(k)}
            </option>
          ))}
        </select>
      </div>

      <ChipGroup
        legend="Combustible"
        value={state.combustible}
        options={FUELS.map((f) => ({ value: f, label: FUEL_LABEL[f] }))}
        onChange={(v) => update({ combustible: v })}
      />
      <ChipGroup
        legend="Transmisión"
        value={state.caja}
        options={TRANSMISSIONS.map((t) => ({ value: t, label: TRANSMISSION_LABEL[t] }))}
        onChange={(v) => update({ caja: v })}
      />
    </form>
  );
}

function ChipGroup({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : o.value)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "border-nova-500 bg-nova-500 text-ink-950"
                  : "border-white/10 bg-ink-900 text-ink-200 hover:border-white/25",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function MobileDrawer({
  open,
  onClose,
  count,
  pending,
  children,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  pending: boolean;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-white/10 bg-ink-900"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <span className="mx-auto h-1.5 w-12 rounded-full bg-white/15" aria-hidden />
              <button type="button" onClick={onClose} className="absolute right-4 top-3 grid h-10 w-10 place-items-center rounded-full text-ink-300 hover:bg-white/5" aria-label="Cerrar filtros">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-4">{children}</div>
            <div className="border-t border-white/10 p-4">
              <button type="button" onClick={onClose} className="btn-primary w-full !py-3.5 text-base">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Ver {count} {count === 1 ? "resultado" : "resultados"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
