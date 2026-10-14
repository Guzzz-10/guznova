import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { CarCard } from "@/components/site/CarCard";
import { Benefits } from "@/components/site/Benefits";
import { ReviewCard } from "@/components/site/ReviewCard";
import { QuickContact } from "@/components/site/QuickContact";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BrandMarquee } from "@/components/site/BrandMarquee";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { Stars } from "@/components/ui/Stars";
import { getFeaturedCars } from "@/lib/cars";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const [settings, featured, reviews, ratingAgg, brands] = await Promise.all([
    getSettings(),
    getFeaturedCars(6),
    prisma.review.findMany({ where: { status: "APROBADA" }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.review.aggregate({ where: { status: "APROBADA" }, _avg: { rating: true }, _count: true }),
    prisma.car.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
  ]);

  const heroCar = featured[0] ?? null;
  const avg = ratingAgg._avg.rating ?? 0;

  return (
    <>
      <Hero
        car={heroCar}
        whatsappHref={waLink(settings.whatsapp, settings.whatsappGenericMessage)}
        stats={{
          sold: Number(settings.statsCarsSold) || 0,
          years: Number(settings.statsYears) || 0,
          satisfaction: Number(settings.statsClients) || 0,
        }}
      />

      <BrandMarquee brands={brands.map((b) => b.brand)} />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Autos destacados"
            title="Elegidos para vos"
            description="Una selección de los autos más buscados de la semana. Todos revisados y listos para transferir."
            action={
              <Link href="/autos" className="btn-ghost group shrink-0">
                Ver todo el catálogo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
          {featured.length > 0 ? (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((car, i) => (
                <StaggerItem key={car.id} className="h-full">
                  <CarCard car={car} priority={i < 2} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="text-ink-400">Pronto vamos a publicar nuevos autos.</p>
          )}
        </div>
      </section>

      <section className="section relative bg-ink-900/40">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Por qué AutoNova"
            title="Comprar un usado, sin sorpresas"
            description="Te acompañamos en todo el proceso: desde elegir el auto hasta que te vas manejando."
          />
          <Benefits />
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Reseñas"
              title="Lo que dicen nuestros clientes"
              description={
                <span className="inline-flex flex-wrap items-center gap-2">
                  <Stars rating={Math.round(avg)} />
                  <span>
                    {avg.toFixed(1).replace(".", ",")} de 5 · {ratingAgg._count} reseñas verificadas
                  </span>
                </span>
              }
              action={
                <Link href="/resenas" className="btn-ghost group shrink-0">
                  Dejar una reseña <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              }
            />
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <StaggerItem key={r.id} className="h-full">
                  <ReviewCard review={r} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="pb-20 sm:pb-28">
        <div className="container">
          <QuickContact settings={settings} />
        </div>
      </section>
    </>
  );
}
