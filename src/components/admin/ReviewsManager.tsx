"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, EyeOff, Inbox, Star, Trash2 } from "lucide-react";
import { deleteReview, setReviewStatus } from "@/app/admin/(panel)/resenas/actions";
import { useConfirm, useToast } from "./Feedback";
import { REVIEW_STATUS_LABEL, type ReviewStatus } from "@/lib/constants";
import { cn } from "@/lib/cn";

type Review = { id: string; name: string; rating: number; comment: string; status: string; createdAt: string };

const TABS: { key: ReviewStatus | "TODAS"; label: string }[] = [
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "APROBADA", label: "Publicadas" },
  { key: "OCULTA", label: "Ocultas" },
  { key: "TODAS", label: "Todas" },
];

const BADGE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  APROBADA: "bg-emerald-100 text-emerald-800",
  OCULTA: "bg-ink-100 text-ink-600",
};

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const hasPending = reviews.some((r) => r.status === "PENDIENTE");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>(hasPending ? "PENDIENTE" : "TODAS");
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();

  const counts = useMemo(() => {
    const m: Record<string, number> = { TODAS: reviews.length };
    for (const r of reviews) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [reviews]);
  const list = tab === "TODAS" ? reviews : reviews.filter((r) => r.status === tab);

  function run(id: string, fn: () => Promise<{ ok: boolean; message: string }>) {
    setBusy(id);
    start(async () => {
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

  async function onDelete(r: Review) {
    const ok = await confirm({
      title: "¿Eliminar esta reseña?",
      message: `Se borrará definitivamente la reseña de ${r.name}. Si solo querés que no se vea, usá “Ocultar”.`,
      confirmText: "Sí, eliminar",
      danger: true,
    });
    if (ok) run(r.id, () => deleteReview(r.id));
  }

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              tab === t.key ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
            )}
          >
            {t.label} <span className="opacity-60">({counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="a-card flex flex-col items-center p-10 text-center text-ink-500">
          <Inbox className="h-10 w-10 text-ink-300" aria-hidden />
          <p className="mt-3 font-semibold text-ink-700">
            {tab === "PENDIENTE" ? "No hay reseñas pendientes. ¡Todo al día!" : "No hay reseñas en esta sección."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={cn("a-card flex flex-col p-5", busy === r.id && "opacity-60")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink-900">{r.name}</p>
                    <p className="text-xs text-ink-500">
                      {new Intl.DateTimeFormat("es-UY", { dateStyle: "long", timeStyle: "short" }).format(new Date(r.createdAt))}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", BADGE[r.status])}>
                    {REVIEW_STATUS_LABEL[r.status as ReviewStatus] ?? r.status}
                  </span>
                </div>
                <span className="mt-3 flex gap-0.5" role="img" aria-label={`${r.rating} de 5 estrellas`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("h-4 w-4", i <= r.rating ? "fill-nova-500 text-nova-500" : "text-ink-200")} aria-hidden />
                  ))}
                </span>
                <p className="mt-3 flex-1 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">{r.comment}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  {r.status !== "APROBADA" && (
                    <button type="button" disabled={busy === r.id} onClick={() => run(r.id, () => setReviewStatus(r.id, "APROBADA"))} className="a-btn bg-emerald-600 text-white hover:bg-emerald-700">
                      <Check className="h-4 w-4" aria-hidden /> {r.status === "PENDIENTE" ? "Aprobar y publicar" : "Mostrar en el sitio"}
                    </button>
                  )}
                  {r.status !== "OCULTA" && (
                    <button type="button" disabled={busy === r.id} onClick={() => run(r.id, () => setReviewStatus(r.id, "OCULTA"))} className="a-btn-secondary">
                      <EyeOff className="h-4 w-4" aria-hidden /> Ocultar
                    </button>
                  )}
                  <button type="button" disabled={busy === r.id} onClick={() => onDelete(r)} className="a-btn ml-auto border border-red-200 bg-white text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
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
