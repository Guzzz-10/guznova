import { Clock, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Motion";
import type { Settings } from "@/lib/settings-defaults";
import { waLink } from "@/lib/whatsapp";

export function QuickContact({ settings }: { settings: Settings }) {
  return (
    <Reveal>
      <div className="relative isolate overflow-hidden rounded-[28px] border border-nova-500/20 bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 p-7 sm:p-12">
        <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-nova-500/25 blur-[100px]" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Contacto rápido</p>
            <h2 className="mt-3 text-3xl font-bold text-white text-balance sm:text-4xl">
              ¿Viste un auto que te gusta? Escribinos y coordinamos una visita.
            </h2>
            <p className="mt-4 text-ink-300">
              Respondemos en minutos durante el horario de atención. También podés pasar por el local sin cita previa.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink(settings.whatsapp, settings.whatsappGenericMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-3.5 text-base"
              >
                <WhatsAppIcon className="h-5 w-5" /> Escribir por WhatsApp
              </a>
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn-ghost !py-3.5 text-base">
                  <Phone className="h-4 w-4" aria-hidden /> Llamar al {settings.phone}
                </a>
              )}
            </div>
          </div>
          <ul className="grid gap-3">
            <li className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-nova-400" aria-hidden />
              <div>
                <p className="font-semibold text-white">Dirección</p>
                <p className="text-sm text-ink-300">
                  {settings.address}, {settings.city}
                </p>
              </div>
            </li>
            <li className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-nova-400" aria-hidden />
              <div>
                <p className="font-semibold text-white">Horario</p>
                <p className="whitespace-pre-line text-sm text-ink-300">{settings.hours}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
