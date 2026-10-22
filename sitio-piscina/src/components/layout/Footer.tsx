import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Ola } from "@/components/ui/Ola";
import { IconoFacebook, IconoInstagram, IconoTikTok, IconoWhatsApp } from "@/components/ui/IconosMarca";
import { navegacion } from "@/config/sitio";
import type { DatosNegocio } from "@/lib/contenido/tipos";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export function Footer({ negocio: sitio, whatsapp }: { negocio: DatosNegocio; whatsapp: string }) {
  const anio = new Date().getFullYear();
  const redes = [
    { href: sitio.redes.instagram, label: "Instagram", Icono: IconoInstagram },
    { href: sitio.redes.facebook, label: "Facebook", Icono: IconoFacebook },
    { href: sitio.redes.tiktok, label: "TikTok", Icono: IconoTikTok },
    { href: enlaceWhatsApp(whatsapp), label: "WhatsApp", Icono: IconoWhatsApp },
  ];

  return (
    <footer className="relative bg-mar-950 text-mar-100">
      <Ola className="absolute inset-x-0 -top-12 text-mar-950 sm:-top-16 lg:-top-20" variante={3} />
      <div className="contenedor grid gap-10 pt-16 pb-28 sm:pb-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Logo nombre={sitio.nombre} eslogan={sitio.eslogan} logoUrl={sitio.logoUrl} claro />
          <p className="mt-5 max-w-sm text-mar-200">{sitio.descripcion}</p>
          <ul className="mt-6 flex gap-3" aria-label="Redes sociales">
            {redes.filter((r) => r.href).map(({ href, label, Icono }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-2xl bg-white/10 text-white transition hover:-translate-y-1 hover:bg-agua-600"
                >
                  <Icono className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Enlaces rápidos</h2>
            <ul className="mt-4 grid gap-2.5">
              {navegacion.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} className="text-mar-200 transition hover:text-sol-300">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/terminos" className="text-mar-200 transition hover:text-sol-300">
                  Términos y privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <Clock className="size-5 text-sol-300" aria-hidden="true" /> Horarios
            </h2>
            <dl className="mt-4 grid gap-3">
              {sitio.horarios.map((h) => (
                <div key={h.dias}>
                  <dt className="text-sm font-semibold text-agua-200">{h.dias}</dt>
                  <dd className="text-mar-100">{h.horas}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h2 className="font-display text-lg font-semibold text-white">Contacto</h2>
            <address className="mt-4 grid gap-3 not-italic">
              <a href={sitio.mapa.enlace} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 text-mar-100 hover:text-sol-300">
                <MapPin className="mt-0.5 size-5 shrink-0 text-coral-400" aria-hidden="true" />
                <span>
                  {sitio.direccion}
                  <br />
                  {sitio.ciudad}, {sitio.pais}
                </span>
              </a>
              <a href={`tel:${sitio.telefono.replace(/\s/g, "")}`} className="flex gap-2.5 text-mar-100 hover:text-sol-300">
                <Phone className="mt-0.5 size-5 shrink-0 text-coral-400" aria-hidden="true" />
                {sitio.telefono}
              </a>
              <a href={`mailto:${sitio.email}`} className="flex gap-2.5 break-all text-mar-100 hover:text-sol-300">
                <Mail className="mt-0.5 size-5 shrink-0 text-coral-400" aria-hidden="true" />
                {sitio.email}
              </a>
            </address>
          </div>

          <div className="col-span-2 overflow-hidden rounded-3xl ring-1 ring-white/10 sm:col-span-3">
            <iframe
              title={`Mapa: cómo llegar a ${sitio.nombre}`}
              src={sitio.mapa.embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-56 w-full border-0 grayscale-[30%] sm:h-64"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-2 py-6 text-sm text-mar-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {anio} {sitio.nombreCompleto}. {sitio.ciudad}, {sitio.pais}.
          </p>
          <p>Hecho con 💙 y mucha agua.</p>
        </div>
      </div>
    </footer>
  );
}
