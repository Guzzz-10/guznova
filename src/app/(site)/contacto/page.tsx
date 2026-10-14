import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { MapEmbed } from "@/components/site/MapEmbed";
import { SocialLinks } from "@/components/site/SocialLinks";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por WhatsApp, llamanos o visitanos en nuestro local. Horarios, dirección y mapa.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = waLink(s.whatsapp, s.whatsappGenericMessage);
  const items = [
    { Icon: WhatsAppIcon, title: "WhatsApp", value: `+${s.whatsapp}`, href: wa, external: true, accent: true },
    ...(s.phone ? [{ Icon: Phone, title: "Teléfono", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` }] : []),
    ...(s.email ? [{ Icon: Mail, title: "Email", value: s.email, href: `mailto:${s.email}` }] : []),
    { Icon: MapPin, title: "Dirección", value: `${s.address}, ${s.city}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos"
        description="Respondemos rápido por WhatsApp. Si preferís, vení a conocernos al local: no hace falta cita previa."
      />
      <section className="pb-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {items.map(({ Icon, title, value, href, external, accent }) => {
                const content = (
                  <>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-[#25D366] text-ink-950" : "bg-nova-500/10 text-nova-400"}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-ink-400">{title}</span>
                      <span className="block break-words font-semibold text-white">{value}</span>
                    </span>
                  </>
                );
                return (
                  <StaggerItem key={title}>
                    {href ? (
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="card-surface flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-nova-500/30"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="card-surface flex items-center gap-4 p-4">{content}</div>
                    )}
                  </StaggerItem>
                );
              })}
            </Stagger>

            <Reveal className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="h-5 w-5 text-nova-400" aria-hidden /> Horario de atención
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-300">{s.hours}</p>
            </Reveal>

            <Reveal className="card-surface p-6">
              <h2 className="text-lg font-semibold text-white">Seguinos en redes</h2>
              <p className="mb-4 mt-1 text-sm text-ink-400">Publicamos los ingresos nuevos antes que en ningún lado.</p>
              <SocialLinks settings={s} />
            </Reveal>

            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full !py-4 text-base">
              <WhatsAppIcon className="h-5 w-5" /> Escribinos ahora
            </a>
          </div>

          <Reveal delay={0.1}>
            <MapEmbed query={s.mapQuery || `${s.address}, ${s.city}, Uruguay`} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
