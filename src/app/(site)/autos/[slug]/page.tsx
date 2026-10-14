import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  Calendar,
  Car as CarIcon,
  Check,
  ChevronRight,
  Cog,
  DoorOpen,
  Fuel,
  Gauge,
  Info,
  Palette,
  Wrench,
} from "lucide-react";
import { Gallery } from "@/components/site/Gallery";
import { CarCard } from "@/components/site/CarCard";
import { StatusBadge } from "@/components/site/StatusBadge";
import { InterestButton } from "@/components/site/InterestButton";
import { ShareButton } from "@/components/site/ShareButton";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { getCarBySlug, getSimilarCars } from "@/lib/cars";
import { FUEL_LABEL, TRANSMISSION_LABEL, label } from "@/lib/constants";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { carMessage, waLink } from "@/lib/whatsapp";

const getCar = cache(getCarBySlug);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCar((await params).slug);
  if (!car) return { title: "Auto no encontrado" };
  const title = `${carTitle(car)} ${car.version} — ${formatPrice(car.price)}`;
  const description = `${carTitle(car)} ${car.version}, ${formatKm(car.km)}, ${label(FUEL_LABEL, car.fuel)}, ${label(
    TRANSMISSION_LABEL,
    car.transmission,
  ).toLowerCase()}. ${car.description}`.slice(0, 200);
  return {
    title,
    description,
    alternates: { canonical: `/autos/${car.slug}` },
    // La imagen para compartir la genera opengraph-image.tsx (foto + precio).
    openGraph: { title, description, type: "website", url: `/autos/${car.slug}` },
  };
}

export default async function CarPage({ params }: Props) {
  const car = await getCar((await params).slug);
  if (!car) notFound();

  const [settings, similar] = await Promise.all([getSettings(), getSimilarCars(car)]);
  const title = carTitle(car);
  const url = siteUrl(`/autos/${car.slug}`);
  const sold = car.status === "VENDIDO";
  const message = sold
    ? `Hola AutoNova! Vi que el ${title} ya fue vendido. ¿Tienen algo similar? ${url}`
    : carMessage(settings.whatsappCarMessage, car, url);
  const href = waLink(settings.whatsapp, message);
  const equipment = car.equipment
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const specs = [
    { Icon: Calendar, label: "Año", value: String(car.year) },
    { Icon: Gauge, label: "Kilometraje", value: formatKm(car.km) },
    { Icon: Fuel, label: "Combustible", value: label(FUEL_LABEL, car.fuel) },
    { Icon: Cog, label: "Transmisión", value: label(TRANSMISSION_LABEL, car.transmission) },
    { Icon: Wrench, label: "Motor", value: car.engine },
    { Icon: Palette, label: "Color", value: car.color },
    ...(car.bodyType ? [{ Icon: CarIcon, label: "Carrocería", value: car.bodyType }] : []),
    { Icon: DoorOpen, label: "Puertas", value: String(car.doors) },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${title} ${car.version}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    fuelType: label(FUEL_LABEL, car.fuel),
    vehicleTransmission: label(TRANSMISSION_LABEL, car.transmission),
    color: car.color,
    image: car.images.map((i) => siteUrl(i.url)),
    url,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "USD",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container pt-24 sm:pt-28">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-ink-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-white">
                Inicio
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li>
              <Link href="/autos" className="hover:text-white">
                Autos
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li aria-current="page" className="text-ink-200">
              {title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          <Reveal y={16}>
            <Gallery images={car.images} title={title} sold={sold} />
          </Reveal>

          <Reveal y={16} delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <StatusBadge status={car.status} />
              <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                {car.brand} {car.model}
              </h1>
              <p className="mt-1 text-lg text-ink-300">
                {car.version} · {car.year}
              </p>
              <p className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
                <span className="mr-2 align-middle text-lg font-semibold text-ink-400">USD</span>
                {formatPrice(car.price).replace("USD ", "")}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                {specs.slice(0, 4).map(({ Icon, label: l, value }) => (
                  <div key={l} className="flex flex-col rounded-2xl border border-white/[0.06] bg-ink-850 p-4">
                    <dt className="flex items-center gap-1.5 text-xs text-ink-400">
                      <Icon className="h-3.5 w-3.5" aria-hidden /> {l}
                    </dt>
                    <dd className="mt-1 font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>

              {car.status === "RESERVADO" && (
                <p className="mt-5 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Este auto está reservado. Escribinos y te avisamos si vuelve a estar disponible.
                </p>
              )}
              {sold && (
                <p className="mt-5 flex gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Este auto ya fue vendido. ¡Consultanos y te buscamos uno similar!
                </p>
              )}

              <div className="mt-6 grid gap-3">
                <InterestButton href={href} sold={sold} className="w-full" />
                <ShareButton url={url} title={`${title} — ${formatPrice(car.price)}`} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                Precio y disponibilidad sujetos a confirmación. Las fotos son ilustrativas. Ver{" "}
                <Link href="/terminos" className="underline hover:text-ink-300">
                  términos y condiciones
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          <div className="space-y-8">
            {car.description && (
              <Reveal>
                <h2 className="text-2xl font-bold text-white">Descripción</h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-300">{car.description}</p>
              </Reveal>
            )}
            {equipment.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-bold text-white">Equipamiento</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {equipment.map((e) => (
                    <li key={e} className="flex gap-3 text-ink-200">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nova-500/15 text-nova-400">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      {e}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
          <Reveal>
            <h2 className="text-2xl font-bold text-white">Ficha técnica</h2>
            <dl className="card-surface mt-4 divide-y divide-white/5 px-5">
              {specs.map(({ Icon, label: l, value }) => (
                <div key={l} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                  <dt className="flex items-center gap-2 text-ink-400">
                    <Icon className="h-4 w-4" aria-hidden /> {l}
                  </dt>
                  <dd className="text-right font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal>
              <h2 className="mb-8 text-3xl font-bold text-white">Autos similares</h2>
            </Reveal>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((c) => (
                <StaggerItem key={c.id} className="h-full">
                  <CarCard car={c} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Barra fija en celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-950/90 p-3 backdrop-blur-xl lg:hidden">
        <div className="container flex items-center gap-3 !px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-400">{title}</p>
            <p className="font-display text-lg font-bold text-white">{formatPrice(car.price)}</p>
          </div>
          <InterestButton href={href} sold={sold} className="!px-5 !py-3 !text-sm" />
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
