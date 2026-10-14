import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Cog, Fuel, Gauge, Sparkles } from "lucide-react";
import type { CarCardData } from "@/lib/cars";
import { FUEL_LABEL, TRANSMISSION_LABEL, label } from "@/lib/constants";
import { formatKm, formatPrice } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/cn";

export function CarCard({ car, priority = false }: { car: CarCardData; priority?: boolean }) {
  const sold = car.status === "VENDIDO";
  return (
    <Link
      href={`/autos/${car.slug}`}
      className="group card-surface relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-nova-500/30 hover:shadow-glow motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        {car.cover ? (
          <Image
            src={car.cover.url}
            alt={car.cover.alt || `${car.brand} ${car.model} ${car.year}`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover transition duration-700 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100",
              sold && "grayscale-[60%]",
            )}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-400">Sin fotos</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusBadge status={car.status} />
        </div>
        {car.featured && !sold && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-nova-500 px-2.5 py-1 text-xs font-bold text-ink-950">
            <Sparkles className="h-3 w-3" aria-hidden /> Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {car.brand} {car.model}
            </h3>
            <p className="truncate text-sm text-ink-400">{car.version || " "}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-ink-300 transition duration-300 group-hover:rotate-45 group-hover:border-nova-500 group-hover:bg-nova-500 group-hover:text-ink-950">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] text-ink-300">
          <li className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-ink-500" aria-hidden /> {car.year}
          </li>
          <li className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-ink-500" aria-hidden /> {formatKm(car.km)}
          </li>
          <li className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-ink-500" aria-hidden /> {label(FUEL_LABEL, car.fuel)}
          </li>
          <li className="flex items-center gap-1.5">
            <Cog className="h-3.5 w-3.5 text-ink-500" aria-hidden /> {label(TRANSMISSION_LABEL, car.transmission)}
          </li>
        </ul>

        <div className="mt-auto pt-5" />
        <div className="flex items-end justify-between border-t border-white/5 pt-4">
          <p className={cn("font-display text-2xl font-bold", sold ? "text-ink-400 line-through decoration-1" : "text-white")}>
            {formatPrice(car.price)}
          </p>
          <span className="text-xs font-medium text-nova-400 opacity-0 transition group-hover:opacity-100">Ver detalles</span>
        </div>
      </div>
    </Link>
  );
}
