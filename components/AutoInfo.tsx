"use client";

import { MessageCircle } from "lucide-react";
import type { Auto } from "@/data/autos";
import { km, usd } from "@/lib/format";
import { waLink } from "@/lib/site";
import { Button } from "./ui/Button";

export function AutoInfo({ auto, onNavigate }: { auto: Auto; onNavigate?: () => void }) {
  const specs: [string, string][] = [
    ["Año", String(auto.anio)],
    ["Kilometraje", km(auto.km)],
    ["Combustible", auto.combustible],
    ["Transmisión", auto.transmision],
    ["Color", auto.color],
    ["Motor", auto.motor],
  ];

  return (
    <div className="flex flex-col">
      <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-accent">
        {auto.marca}
      </p>
      <h2 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
        {auto.modelo}{" "}
        <span className="text-muted">{auto.version}</span>
      </h2>
      <p className="mt-4 text-3xl font-medium tracking-tight">{usd(auto.precio)}</p>

      <dl className="mt-8 grid grid-cols-2 border-t border-line">
        {specs.map(([k, v], idx) => (
          <div
            key={k}
            className={`border-b border-line py-3.5 ${idx % 2 === 0 ? "pr-4" : "border-l pl-4"}`}
          >
            <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{k}</dt>
            <dd className="mt-1 text-[15px]">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 leading-relaxed text-muted">{auto.descripcion}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {auto.equipamiento.map((e) => (
          <li
            key={e}
            className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-fg/80"
          >
            {e}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          external
          href={waLink(
            `Hola GuzNova! Me interesa el ${auto.marca} ${auto.modelo} ${auto.version} ${auto.anio} (${usd(auto.precio)}). ¿Sigue disponible?`,
          )}
          arrow={false}
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          Consultar por WhatsApp
        </Button>
        <Button href="/#financiacion" variant="ghost" onClick={onNavigate}>
          Simular cuota
        </Button>
      </div>
    </div>
  );
}
