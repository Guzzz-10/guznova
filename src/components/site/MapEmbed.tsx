"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useConsent } from "@/lib/consent";

/**
 * Mapa de Google embebido. Google puede instalar cookies propias, por eso
 * solo se carga si el visitante aceptó las cookies o pide verlo explícitamente.
 */
export function MapEmbed({ query }: { query: string }) {
  const consent = useConsent();
  const [forced, setForced] = useState(false);
  const show = consent === "accepted" || forced;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-ink-850 sm:aspect-[16/10]">
      {show ? (
        <iframe
          src={src}
          title={`Mapa: ${query}`}
          className="h-full w-full grayscale-[30%] invert-[90%] hue-rotate-180"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-grid p-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-nova-500/15 text-nova-400">
            <MapPin className="h-7 w-7" aria-hidden />
          </span>
          <p className="max-w-sm text-sm text-ink-300">
            El mapa lo provee Google y puede usar cookies de terceros. Cargalo solo si estás de acuerdo.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setForced(true)} className="btn-primary !py-2.5">
              Cargar mapa
            </button>
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5">
              Abrir en Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
