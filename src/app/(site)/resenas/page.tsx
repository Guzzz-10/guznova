import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { ReviewCard } from "@/components/site/ReviewCard";
import { ReviewForm } from "@/components/site/ReviewForm";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { Stars } from "@/components/ui/Stars";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Reseñas de clientes",
  description: "Leé lo que opinan nuestros clientes y dejá tu propia reseña sobre tu experiencia en AutoNova.",
  alternates: { canonical: "/resenas" },
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ where: { status: "APROBADA" }, orderBy: { createdAt: "desc" } });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  return (
    <>
      <PageHeader
        eyebrow="Reseñas"
        title="La opinión de nuestros clientes"
        description="Las reseñas se publican luego de ser revisadas por nuestro equipo, para mantener un espacio respetuoso y real."
      />
      <section className="pb-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            {reviews.length > 0 && (
              <Reveal className="card-surface mb-8 flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                <div className="text-center sm:w-40">
                  <p className="font-display text-5xl font-bold text-white">{avg.toFixed(1).replace(".", ",")}</p>
                  <Stars rating={Math.round(avg)} className="mt-2" />
                  <p className="mt-1 text-xs text-ink-400">{reviews.length} reseñas</p>
                </div>
                <ul className="flex-1 space-y-1.5" aria-label="Distribución de calificaciones">
                  {dist.map(({ n, count }) => (
                    <li key={n} className="flex items-center gap-3 text-xs text-ink-400">
                      <span className="w-14">{n} estrellas</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <span
                          className="block h-full rounded-full bg-nova-500"
                          style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="w-4 text-right">{count}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {reviews.length > 0 ? (
              <Stagger className="grid gap-5 md:grid-cols-2">
                {reviews.map((r) => (
                  <StaggerItem key={r.id} className="h-full">
                    <ReviewCard review={r} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <p className="text-ink-400">Todavía no hay reseñas publicadas. ¡Sé el primero en dejar la tuya!</p>
            )}
          </div>

          <Reveal delay={0.1}>
            <div className="card-surface relative p-6 lg:sticky lg:top-28">
              <h2 className="text-2xl font-bold text-white">Dejá tu reseña</h2>
              <p className="mb-6 mt-2 text-sm text-ink-400">Tu opinión ayuda a otras personas a elegir con confianza.</p>
              <ReviewForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
