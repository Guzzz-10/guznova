"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, ImageOff, Pencil, Search, Star, Trash2 } from "lucide-react";
import { deleteCar, setCarFeatured, setCarStatus, type ActionResult } from "@/app/admin/(panel)/autos/actions";
import { useConfirm, useToast } from "./Feedback";
import { CAR_STATUS, STATUS_LABEL } from "@/lib/constants";
import { formatKm, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type Row = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  km: number;
  status: string;
  featured: boolean;
  cover: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  DISPONIBLE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  RESERVADO: "border-amber-200 bg-amber-50 text-amber-800",
  VENDIDO: "border-rose-200 bg-rose-50 text-rose-800",
};

export function CarsList({ cars, initialFilter }: { cars: Row[]; initialFilter: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const toast = useToast();
  const confirm = useConfirm();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cars.filter(
      (c) =>
        (filter === "TODOS" || c.status === filter) &&
        (!term || `${c.title} ${c.subtitle}`.toLowerCase().includes(term)),
    );
  }, [cars, q, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { TODOS: cars.length };
    for (const c of cars) m[c.status] = (m[c.status] ?? 0) + 1;
    return m;
  }, [cars]);

  function run(id: string, fn: () => Promise<ActionResult>) {
    setBusy(id);
    startTransition(async () => {
      try {
        const r = await fn();
        toast(r.ok ? "success" : "error", r.message);
      } catch {
        toast("error", "Algo salió mal. Probá de nuevo.");
      } finally {
        setBusy(null);
      }
    });
  }

  async function onDelete(car: Row) {
    const ok = await confirm({
      title: `¿Eliminar ${car.title}?`,
      message: "Se borrará del sitio junto con sus fotos. Esta acción no se puede deshacer. Si solo se vendió, podés marcarlo como Vendido.",
      confirmText: "Sí, eliminar",
      danger: true,
    });
    if (ok) run(car.id, () => deleteCar(car.id));
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {["TODOS", ...CAR_STATUS].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                filter === s ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
              )}
            >
              {s === "TODOS" ? "Todos" : STATUS_LABEL[s as keyof typeof STATUS_LABEL]} <span className="opacity-60">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Buscar auto</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por marca o modelo…" className="a-field pl-9" />
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="a-card p-10 text-center text-ink-500">
          {cars.length === 0 ? (
            <>
              <p className="font-semibold text-ink-700">Todavía no cargaste autos.</p>
              <Link href="/admin/autos/nuevo" className="a-btn-primary mt-4">
                Agregar el primero
              </Link>
            </>
          ) : (
            "No hay autos que coincidan con la búsqueda."
          )}
        </div>
      ) : (
        <ul className="grid gap-3">
          <AnimatePresence initial={false}>
            {visible.map((car) => (
              <motion.li
                key={car.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className={cn("a-card flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4", busy === car.id && "opacity-60")}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <Link href={`/admin/autos/${car.id}`} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-20 sm:w-28">
                    {car.cover ? (
                      <Image src={car.cover} alt="" fill sizes="112px" className="object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-ink-400">
                        <ImageOff className="h-5 w-5" aria-label="Sin fotos" />
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/admin/autos/${car.id}`} className="block truncate text-base font-bold text-ink-900 hover:underline">
                      {car.title}
                    </Link>
                    <p className="truncate text-sm text-ink-500">{car.subtitle}</p>
                    <p className="text-sm font-semibold text-ink-800">
                      {formatPrice(car.price)} <span className="font-normal text-ink-400">· {formatKm(car.km)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`st-${car.id}`}>
                    Estado de {car.title}
                  </label>
                  <select
                    id={`st-${car.id}`}
                    value={car.status}
                    disabled={busy === car.id}
                    onChange={(e) => run(car.id, () => setCarStatus(car.id, e.target.value))}
                    className={cn("rounded-xl border px-3 py-2.5 text-sm font-bold", STATUS_STYLES[car.status])}
                  >
                    {CAR_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy === car.id}
                    onClick={() => run(car.id, () => setCarFeatured(car.id, !car.featured))}
                    aria-pressed={car.featured}
                    title={car.featured ? "Quitar de destacados" : "Marcar como destacado"}
                    className={cn(
                      "a-btn border !px-3",
                      car.featured ? "border-nova-300 bg-nova-50 text-nova-800" : "border-ink-200 bg-white text-ink-500 hover:text-ink-800",
                    )}
                  >
                    <Star className={cn("h-4 w-4", car.featured && "fill-nova-500 text-nova-500")} aria-hidden />
                    <span className="sm:hidden xl:inline">{car.featured ? "Destacado" : "Destacar"}</span>
                  </button>
                  <Link href={`/admin/autos/${car.id}`} className="a-btn-secondary !px-3">
                    <Pencil className="h-4 w-4" aria-hidden /> Editar
                  </Link>
                  <a href={`/autos/${car.slug}`} target="_blank" className="a-btn-secondary !px-3" title="Ver en el sitio">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Ver en el sitio</span>
                  </a>
                  <button type="button" onClick={() => onDelete(car)} disabled={busy === car.id} className="a-btn border border-red-200 bg-white !px-3 text-red-600 hover:bg-red-50" title="Eliminar">
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Eliminar</span>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
